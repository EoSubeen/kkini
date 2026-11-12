create or replace function public.persist_calculation_snapshot(
  p_input jsonb,
  p_schema_version integer,
  p_calculation_version text,
  p_assumption_version text,
  p_result jsonb,
  p_selected_recipe_ids text[],
  p_housing jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_input_id uuid;
  v_calculation_id uuid;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  insert into public.financial_input_snapshots (
    user_id,
    schema_version,
    input
  ) values (
    v_user_id,
    p_schema_version,
    p_input
  )
  returning id into v_input_id;

  insert into public.calculation_snapshots (
    user_id,
    financial_input_snapshot_id,
    calculation_version,
    assumption_version,
    result
  ) values (
    v_user_id,
    v_input_id,
    p_calculation_version,
    p_assumption_version,
    p_result
  )
  returning id into v_calculation_id;

  insert into public.recipe_selections (
    user_id,
    calculation_snapshot_id,
    selected_recipe_ids,
    housing
  ) values (
    v_user_id,
    v_calculation_id,
    coalesce(p_selected_recipe_ids, '{}'::text[]),
    coalesce(p_housing, '{}'::jsonb)
  );

  return v_calculation_id;
end;
$$;

revoke all on function public.persist_calculation_snapshot(
  jsonb,
  integer,
  text,
  text,
  jsonb,
  text[],
  jsonb
) from public;

grant execute on function public.persist_calculation_snapshot(
  jsonb,
  integer,
  text,
  text,
  jsonb,
  text[],
  jsonb
) to authenticated;
