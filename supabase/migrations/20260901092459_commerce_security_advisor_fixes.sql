-- Security advisor fixes: restore customer address access and prevent direct coupon counter mutation.

drop policy if exists "commerce addresses self" on public.commerce_addresses;
create policy "commerce addresses self" on public.commerce_addresses
for all
using(
  public.commerce_is_admin()
  or customer_id in(select id from public.commerce_customers where auth_user_id=auth.uid())
)
with check(
  public.commerce_is_admin()
  or customer_id in(select id from public.commerce_customers where auth_user_id=auth.uid())
);

revoke all on function public.commerce_increment_coupon_use(text) from public,anon,authenticated;
