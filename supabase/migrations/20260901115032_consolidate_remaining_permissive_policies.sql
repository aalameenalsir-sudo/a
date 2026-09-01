-- Consolidate overlapping permissive RLS policies without changing effective access.

drop policy if exists "commerce admin returns" on public.commerce_returns;
drop policy if exists "commerce return customer insert" on public.commerce_returns;
drop policy if exists "commerce return customer read" on public.commerce_returns;

create policy "commerce returns select" on public.commerce_returns for select to authenticated
using (
  public.commerce_is_admin()
  or customer_id in (
    select cc.id from public.commerce_customers cc
    where cc.auth_user_id = (select auth.uid())
  )
);

create policy "commerce returns insert" on public.commerce_returns for insert to authenticated
with check (
  public.commerce_is_admin()
  or (
    customer_id in (
      select cc.id from public.commerce_customers cc
      where cc.auth_user_id = (select auth.uid())
    )
    and order_id in (
      select o.id from public.commerce_orders o
      join public.commerce_customers c on c.id = o.customer_id
      where c.auth_user_id = (select auth.uid())
    )
  )
);

create policy "commerce returns admin update" on public.commerce_returns for update to authenticated
using (public.commerce_is_admin()) with check (public.commerce_is_admin());
create policy "commerce returns admin delete" on public.commerce_returns for delete to authenticated
using (public.commerce_is_admin());

drop policy if exists "Admins can manage content" on public.content;
drop policy if exists "Public can read content" on public.content;
create policy "Public can read content" on public.content for select to anon using (active = true);
create policy "Authenticated can read content" on public.content for select to authenticated using (active = true or public.is_admin());
create policy "Admins can insert content" on public.content for insert to authenticated with check (public.is_admin());
create policy "Admins can update content" on public.content for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete content" on public.content for delete to authenticated using (public.is_admin());

drop policy if exists "Admins can manage projects" on public.projects;
drop policy if exists "Public can view published projects" on public.projects;
create policy "Public can view published projects" on public.projects for select to anon using (is_published = true);
create policy "Authenticated can view projects" on public.projects for select to authenticated using (
  is_published = true or exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'
  )
);
create policy "Admins can insert projects" on public.projects for insert to authenticated with check (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);
create policy "Admins can update projects" on public.projects for update to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
) with check (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);
create policy "Admins can delete projects" on public.projects for delete to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);

drop policy if exists "Admins can manage services" on public.services;
drop policy if exists "Public can read services" on public.services;
create policy "Public can read services" on public.services for select to anon using (active = true);
create policy "Authenticated can read services" on public.services for select to authenticated using (active = true or public.is_admin());
create policy "Admins can insert services" on public.services for insert to authenticated with check (public.is_admin());
create policy "Admins can update services" on public.services for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete services" on public.services for delete to authenticated using (public.is_admin());

drop policy if exists "Admins can manage settings" on public.settings;
create policy "Admins can insert settings" on public.settings for insert to authenticated with check (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);
create policy "Admins can update settings" on public.settings for update to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
) with check (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);
create policy "Admins can delete settings" on public.settings for delete to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);

drop policy if exists "Admins can manage site content" on public.site_content;
create policy "Admins can insert site content" on public.site_content for insert to authenticated with check (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);
create policy "Admins can update site content" on public.site_content for update to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
) with check (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);
create policy "Admins can delete site content" on public.site_content for delete to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);

drop policy if exists "Admins manage website settings" on public.website_settings;
create policy "Admins can insert website settings" on public.website_settings for insert to authenticated with check (public.is_admin());
create policy "Admins can update website settings" on public.website_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete website settings" on public.website_settings for delete to authenticated using (public.is_admin());
