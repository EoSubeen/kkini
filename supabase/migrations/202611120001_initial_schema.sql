create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  settings jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.households (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default '우리 집' check (char_length(label) between 1 and 40),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (id, user_id)
);

create table public.household_members (
  id uuid primary key default extensions.gen_random_uuid(),
  household_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  member_role text not null check (member_role in ('self', 'spouse', 'child', 'parent')),
  display_name text check (display_name is null or char_length(display_name) between 1 and 40),
  age smallint check (age is null or age between 0 and 120),
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  foreign key (household_id, user_id) references public.households(id, user_id) on delete cascade,
  unique (id, user_id)
);

create table public.financial_input_snapshots (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  household_id uuid,
  schema_version integer not null check (schema_version > 0),
  input jsonb not null check (jsonb_typeof(input) = 'object'),
  created_at timestamptz not null default timezone('utc', now()),
  foreign key (household_id, user_id) references public.households(id, user_id) on delete cascade,
  unique (id, user_id)
);

create table public.calculation_snapshots (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  financial_input_snapshot_id uuid not null,
  calculation_version text not null check (char_length(calculation_version) between 1 and 40),
  assumption_version text not null check (char_length(assumption_version) between 1 and 40),
  money_unit text not null default 'KRW_10K' check (money_unit = 'KRW_10K'),
  result jsonb not null check (jsonb_typeof(result) = 'object'),
  created_at timestamptz not null default timezone('utc', now()),
  foreign key (financial_input_snapshot_id, user_id) references public.financial_input_snapshots(id, user_id) on delete cascade,
  unique (id, user_id)
);

create table public.recipe_selections (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  calculation_snapshot_id uuid not null,
  selected_recipe_ids text[] not null default '{}',
  housing jsonb not null default '{}'::jsonb check (jsonb_typeof(housing) = 'object'),
  recipe_version text not null default '1' check (char_length(recipe_version) between 1 and 40),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  foreign key (calculation_snapshot_id, user_id) references public.calculation_snapshots(id, user_id) on delete cascade,
  unique (calculation_snapshot_id),
  unique (id, user_id)
);

create table public.check_plans (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  calculation_snapshot_id uuid,
  title text not null default '나의 실행 계획' check (char_length(title) between 1 and 80),
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  foreign key (calculation_snapshot_id, user_id) references public.calculation_snapshots(id, user_id) on delete set null (calculation_snapshot_id),
  unique (id, user_id)
);

create table public.check_items (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  check_plan_id uuid not null,
  item_key text not null check (char_length(item_key) between 1 and 80),
  label text not null check (char_length(label) between 1 and 120),
  detail text,
  status text not null default 'todo' check (status in ('todo', 'done', 'skipped')),
  due_date date,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  foreign key (check_plan_id, user_id) references public.check_plans(id, user_id) on delete cascade,
  unique (check_plan_id, item_key),
  unique (id, user_id)
);

create index households_user_id_idx on public.households(user_id);
create index household_members_user_household_idx on public.household_members(user_id, household_id);
create index financial_input_snapshots_user_created_idx on public.financial_input_snapshots(user_id, created_at desc);
create index calculation_snapshots_user_created_idx on public.calculation_snapshots(user_id, created_at desc);
create index calculation_snapshots_input_idx on public.calculation_snapshots(financial_input_snapshot_id);
create index recipe_selections_user_updated_idx on public.recipe_selections(user_id, updated_at desc);
create index check_plans_user_status_idx on public.check_plans(user_id, status);
create index check_items_plan_order_idx on public.check_items(check_plan_id, sort_order);

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger households_set_updated_at before update on public.households for each row execute function public.set_updated_at();
create trigger household_members_set_updated_at before update on public.household_members for each row execute function public.set_updated_at();
create trigger recipe_selections_set_updated_at before update on public.recipe_selections for each row execute function public.set_updated_at();
create trigger check_plans_set_updated_at before update on public.check_plans for each row execute function public.set_updated_at();
create trigger check_items_set_updated_at before update on public.check_items for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(coalesce(new.email, '끼니 사용자'), '@', 1)), 40)
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.financial_input_snapshots enable row level security;
alter table public.calculation_snapshots enable row level security;
alter table public.recipe_selections enable row level security;
alter table public.check_plans enable row level security;
alter table public.check_items enable row level security;

alter table public.profiles force row level security;
alter table public.households force row level security;
alter table public.household_members force row level security;
alter table public.financial_input_snapshots force row level security;
alter table public.calculation_snapshots force row level security;
alter table public.recipe_selections force row level security;
alter table public.check_plans force row level security;
alter table public.check_items force row level security;

create policy profiles_select_own on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy profiles_delete_own on public.profiles for delete to authenticated using ((select auth.uid()) = user_id);

create policy households_select_own on public.households for select to authenticated using ((select auth.uid()) = user_id);
create policy households_insert_own on public.households for insert to authenticated with check ((select auth.uid()) = user_id);
create policy households_update_own on public.households for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy households_delete_own on public.households for delete to authenticated using ((select auth.uid()) = user_id);

create policy household_members_select_own on public.household_members for select to authenticated using ((select auth.uid()) = user_id);
create policy household_members_insert_own on public.household_members for insert to authenticated with check ((select auth.uid()) = user_id);
create policy household_members_update_own on public.household_members for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy household_members_delete_own on public.household_members for delete to authenticated using ((select auth.uid()) = user_id);

create policy financial_input_snapshots_select_own on public.financial_input_snapshots for select to authenticated using ((select auth.uid()) = user_id);
create policy financial_input_snapshots_insert_own on public.financial_input_snapshots for insert to authenticated with check ((select auth.uid()) = user_id);
create policy financial_input_snapshots_delete_own on public.financial_input_snapshots for delete to authenticated using ((select auth.uid()) = user_id);

create policy calculation_snapshots_select_own on public.calculation_snapshots for select to authenticated using ((select auth.uid()) = user_id);
create policy calculation_snapshots_insert_own on public.calculation_snapshots for insert to authenticated with check ((select auth.uid()) = user_id);
create policy calculation_snapshots_delete_own on public.calculation_snapshots for delete to authenticated using ((select auth.uid()) = user_id);

create policy recipe_selections_select_own on public.recipe_selections for select to authenticated using ((select auth.uid()) = user_id);
create policy recipe_selections_insert_own on public.recipe_selections for insert to authenticated with check ((select auth.uid()) = user_id);
create policy recipe_selections_update_own on public.recipe_selections for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy recipe_selections_delete_own on public.recipe_selections for delete to authenticated using ((select auth.uid()) = user_id);

create policy check_plans_select_own on public.check_plans for select to authenticated using ((select auth.uid()) = user_id);
create policy check_plans_insert_own on public.check_plans for insert to authenticated with check ((select auth.uid()) = user_id);
create policy check_plans_update_own on public.check_plans for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy check_plans_delete_own on public.check_plans for delete to authenticated using ((select auth.uid()) = user_id);

create policy check_items_select_own on public.check_items for select to authenticated using ((select auth.uid()) = user_id);
create policy check_items_insert_own on public.check_items for insert to authenticated with check ((select auth.uid()) = user_id);
create policy check_items_update_own on public.check_items for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy check_items_delete_own on public.check_items for delete to authenticated using ((select auth.uid()) = user_id);
