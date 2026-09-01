-- PostgreSQL grants EXECUTE to PUBLIC on functions by default.
-- Remove that implicit grant, then explicitly allow authenticated users only.
revoke execute on function public.commerce_staff_role() from public;
revoke execute on function public.commerce_has_permission(text) from public;
revoke execute on function public.commerce_is_admin() from public;
grant execute on function public.commerce_staff_role() to authenticated;
grant execute on function public.commerce_has_permission(text) to authenticated;
grant execute on function public.commerce_is_admin() to authenticated;
