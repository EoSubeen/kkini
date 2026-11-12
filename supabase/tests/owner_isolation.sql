begin;

create extension if not exists pgtap with schema extensions;
select plan(5);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'owner@example.test', '', now(), '{"provider":"email","providers":["email"]}', '{"display_name":"소유자"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'outsider@example.test', '', now(), '{"provider":"email","providers":["email"]}', '{"display_name":"타 사용자"}', now(), now());

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);

select lives_ok(
  $$insert into public.households (id, user_id, label) values ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '우리 집')$$,
  'owner can insert an owned household'
);
select is((select count(*)::integer from public.households), 1, 'owner can read the owned household');

select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000002', true);
select is((select count(*)::integer from public.households), 0, 'another user cannot read the owner household');
select throws_ok(
  $$insert into public.households (user_id, label) values ('10000000-0000-0000-0000-000000000001', '탈취 시도')$$,
  '42501',
  'new row violates row-level security policy for table "households"',
  'another user cannot insert a row for the owner'
);

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select is((select count(*)::integer from public.households), 0, 'anonymous users cannot read households');

reset role;
select * from finish();
rollback;
