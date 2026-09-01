-- Keep helper RPCs unavailable to anonymous callers.
-- Authenticated execution remains intentional because RLS/admin UI uses these helpers.
revoke execute on function public.commerce_staff_role() from anon;
revoke execute on function public.commerce_has_permission(text) from anon;
revoke execute on function public.commerce_is_admin() from anon;
