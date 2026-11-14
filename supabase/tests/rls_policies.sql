begin;
set local role postgres;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select extensions.plan(17);

select extensions.ok(relrowsecurity, relname || ' has RLS enabled')
from pg_class
where relnamespace = 'public'::regnamespace
  and relname in (
    'profiles', 'households', 'household_members', 'financial_input_snapshots',
    'calculation_snapshots', 'recipe_selections', 'check_plans', 'check_items'
  )
order by relname;

select extensions.is((select count(*)::integer from pg_policies where schemaname = 'public' and tablename = 'profiles'), 3, 'profiles exposes owner read/update/delete only');
select extensions.is((select count(*)::integer from pg_policies where schemaname = 'public' and tablename = 'financial_input_snapshots'), 3, 'financial input snapshots are immutable through RLS');
select extensions.is((select count(*)::integer from pg_policies where schemaname = 'public' and tablename = 'calculation_snapshots'), 3, 'calculation snapshots are immutable through RLS');
select extensions.is((select count(*)::integer from pg_policies where schemaname = 'public' and tablename = 'households'), 4, 'households has owner CRUD policies');
select extensions.is((select count(*)::integer from pg_policies where schemaname = 'public' and tablename = 'household_members'), 4, 'household members has owner CRUD policies');
select extensions.is((select count(*)::integer from pg_policies where schemaname = 'public' and tablename = 'recipe_selections'), 4, 'recipe selections has owner CRUD policies');
select extensions.is((select count(*)::integer from pg_policies where schemaname = 'public' and tablename = 'check_plans'), 4, 'check plans has owner CRUD policies');
select extensions.is((select count(*)::integer from pg_policies where schemaname = 'public' and tablename = 'check_items'), 4, 'check items has owner CRUD policies');

select extensions.is(
  (select count(*)::integer from pg_policies where schemaname = 'public' and roles = '{authenticated}' and qual like '%auth.uid()%'),
  22,
  'all select/update/delete policies require the authenticated owner'
);

select * from extensions.finish();
rollback;
