-- Jay's Engineering Lab V0.3 security hardening
-- Remove unnecessary PUBLIC execution from internal authorization/trigger functions.

revoke execute on function public.entity_owned_by_user(text, uuid, uuid) from public;
grant execute on function public.entity_owned_by_user(text, uuid, uuid) to authenticated;

revoke execute on function public.set_updated_at() from public;
