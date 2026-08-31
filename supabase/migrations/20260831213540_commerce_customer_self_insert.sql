-- Reconciles the already-applied production migration that lets authenticated
-- customers create their own commerce profile before using account features.
drop policy if exists "commerce customer self insert" on public.commerce_customers;
create policy "commerce customer self insert"
on public.commerce_customers
for insert
with check (auth.uid() = auth_user_id);
