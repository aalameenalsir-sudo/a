create or replace function public.commerce_staff_role() returns text
language sql stable security definer set search_path=public as $$
 select coalesce((select role from public.commerce_staff_roles where user_id=auth.uid() and active limit 1),
                 (select case when role='admin' then 'admin' else null end from public.profiles where id=auth.uid() limit 1));
$$;

create or replace function public.commerce_has_permission(permission text) returns boolean
language plpgsql stable security definer set search_path=public as $$
declare r text := public.commerce_staff_role();
begin
 if r is null then return false; end if;
 if r in ('owner','admin') then return true; end if;
 case permission
  when 'catalog.write' then return r in ('store_manager','marketing');
  when 'orders.write' then return r in ('store_manager','fulfillment','support');
  when 'customers.write' then return r in ('store_manager','sales_crm','support');
  when 'finance.write' then return r in ('finance');
  when 'settings.write' then return r in ('store_manager');
  when 'reports.read' then return r in ('store_manager','finance','marketing','sales_crm','viewer');
  else return false;
 end case;
end $$;

create or replace function public.commerce_is_admin() returns boolean language sql stable security definer set search_path=public as $$
 select public.commerce_staff_role() in ('owner','admin');
$$;

alter table public.commerce_branches enable row level security;
alter table public.commerce_digital_files enable row level security;
alter table public.commerce_digital_entitlements enable row level security;
alter table public.commerce_service_jobs enable row level security;
alter table public.commerce_service_files enable row level security;
alter table public.commerce_staff_roles enable row level security;
alter table public.commerce_returns_items enable row level security;
alter table public.commerce_automation_rules enable row level security;
alter table public.commerce_automation_events enable row level security;
alter table public.commerce_notification_templates enable row level security;

drop policy if exists "commerce public branches" on public.commerce_branches;
create policy "commerce public branches" on public.commerce_branches for select using(active);
drop policy if exists "commerce staff branches" on public.commerce_branches;
create policy "commerce staff branches" on public.commerce_branches for all using(public.commerce_has_permission('settings.write')) with check(public.commerce_has_permission('settings.write'));

drop policy if exists "commerce catalog digital files" on public.commerce_digital_files;
create policy "commerce catalog digital files" on public.commerce_digital_files for all using(public.commerce_has_permission('catalog.write')) with check(public.commerce_has_permission('catalog.write'));

drop policy if exists "commerce entitlement self" on public.commerce_digital_entitlements;
create policy "commerce entitlement self" on public.commerce_digital_entitlements for select using(public.commerce_is_admin() or customer_id in(select id from public.commerce_customers where auth_user_id=auth.uid()));

drop policy if exists "commerce service job self" on public.commerce_service_jobs;
create policy "commerce service job self" on public.commerce_service_jobs for select using(public.commerce_has_permission('orders.write') or customer_id in(select id from public.commerce_customers where auth_user_id=auth.uid()));
drop policy if exists "commerce service job staff write" on public.commerce_service_jobs;
create policy "commerce service job staff write" on public.commerce_service_jobs for all using(public.commerce_has_permission('orders.write')) with check(public.commerce_has_permission('orders.write'));

drop policy if exists "commerce service files self" on public.commerce_service_files;
create policy "commerce service files self" on public.commerce_service_files for select using(
 public.commerce_has_permission('orders.write') or
 (visibility='customer' and service_job_id in(select j.id from public.commerce_service_jobs j join public.commerce_customers c on c.id=j.customer_id where c.auth_user_id=auth.uid()))
);
drop policy if exists "commerce service files staff" on public.commerce_service_files;
create policy "commerce service files staff" on public.commerce_service_files for all using(public.commerce_has_permission('orders.write')) with check(public.commerce_has_permission('orders.write'));

drop policy if exists "commerce staff roles read" on public.commerce_staff_roles;
create policy "commerce staff roles read" on public.commerce_staff_roles for select using(public.commerce_is_admin() or user_id=auth.uid());
drop policy if exists "commerce staff roles admin" on public.commerce_staff_roles;
create policy "commerce staff roles admin" on public.commerce_staff_roles for all using(public.commerce_is_admin()) with check(public.commerce_is_admin());

drop policy if exists "commerce returns items self" on public.commerce_returns_items;
create policy "commerce returns items self" on public.commerce_returns_items for select using(public.commerce_has_permission('orders.write') or return_id in(select r.id from public.commerce_returns r join public.commerce_customers c on c.id=r.customer_id where c.auth_user_id=auth.uid()));
drop policy if exists "commerce returns items customer insert" on public.commerce_returns_items;
create policy "commerce returns items customer insert" on public.commerce_returns_items for insert with check(return_id in(select r.id from public.commerce_returns r join public.commerce_customers c on c.id=r.customer_id where c.auth_user_id=auth.uid()));

drop policy if exists "commerce automation admin" on public.commerce_automation_rules;
create policy "commerce automation admin" on public.commerce_automation_rules for all using(public.commerce_is_admin()) with check(public.commerce_is_admin());
drop policy if exists "commerce automation events admin" on public.commerce_automation_events;
create policy "commerce automation events admin" on public.commerce_automation_events for select using(public.commerce_is_admin());
drop policy if exists "commerce notification templates admin" on public.commerce_notification_templates;
create policy "commerce notification templates admin" on public.commerce_notification_templates for all using(public.commerce_has_permission('settings.write') or public.commerce_is_admin()) with check(public.commerce_has_permission('settings.write') or public.commerce_is_admin());

create index if not exists commerce_entitlements_customer_idx on public.commerce_digital_entitlements(customer_id,created_at desc);
create index if not exists commerce_service_jobs_customer_idx on public.commerce_service_jobs(customer_id,created_at desc);
create index if not exists commerce_service_jobs_status_idx on public.commerce_service_jobs(status,created_at desc);
create index if not exists commerce_automation_events_pending_idx on public.commerce_automation_events(processed_at,created_at) where processed_at is null;

insert into storage.buckets(id,name,public) values('commerce-product-media','commerce-product-media',true) on conflict(id) do update set public=true;
insert into storage.buckets(id,name,public) values('commerce-digital-files','commerce-digital-files',false) on conflict(id) do update set public=false;
insert into storage.buckets(id,name,public) values('commerce-service-files','commerce-service-files',false) on conflict(id) do update set public=false;

-- Existing profiles.role='admin' users are automatically recognized by commerce_staff_role().

create or replace function public.commerce_increment_coupon_use(coupon_code text) returns void
language sql security definer set search_path=public as $$
 update public.commerce_coupons set uses=uses+1 where code=upper(coupon_code) and active=true;
$$;

create table if not exists public.commerce_crm_notes(
 id uuid primary key default gen_random_uuid(),
 customer_id uuid not null references public.commerce_customers(id) on delete cascade,
 author_id uuid references auth.users(id) on delete set null,
 note text not null,
 created_at timestamptz not null default now()
);
create table if not exists public.commerce_followups(
 id uuid primary key default gen_random_uuid(),
 customer_id uuid not null references public.commerce_customers(id) on delete cascade,
 assigned_user_id uuid references auth.users(id) on delete set null,
 title text not null,
 due_at timestamptz,
 status text not null default 'open' check(status in('open','done','cancelled')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.commerce_crm_notes enable row level security;
alter table public.commerce_followups enable row level security;
drop policy if exists "commerce crm notes staff" on public.commerce_crm_notes;
create policy "commerce crm notes staff" on public.commerce_crm_notes for all using(public.commerce_has_permission('customers.write') or public.commerce_is_admin()) with check(public.commerce_has_permission('customers.write') or public.commerce_is_admin());
drop policy if exists "commerce followups staff" on public.commerce_followups;
create policy "commerce followups staff" on public.commerce_followups for all using(public.commerce_has_permission('customers.write') or public.commerce_is_admin()) with check(public.commerce_has_permission('customers.write') or public.commerce_is_admin());
create index if not exists commerce_followups_customer_idx on public.commerce_followups(customer_id,due_at);

-- Permission policies complement the original owner/admin policies.
drop policy if exists "commerce staff catalog products" on public.commerce_products;
create policy "commerce staff catalog products" on public.commerce_products for all using(public.commerce_has_permission('catalog.write')) with check(public.commerce_has_permission('catalog.write'));
drop policy if exists "commerce staff catalog categories" on public.commerce_categories;
create policy "commerce staff catalog categories" on public.commerce_categories for all using(public.commerce_has_permission('catalog.write')) with check(public.commerce_has_permission('catalog.write'));
drop policy if exists "commerce staff catalog variants" on public.commerce_product_variants;
create policy "commerce staff catalog variants" on public.commerce_product_variants for all using(public.commerce_has_permission('catalog.write')) with check(public.commerce_has_permission('catalog.write'));
drop policy if exists "commerce staff orders" on public.commerce_orders;
create policy "commerce staff orders" on public.commerce_orders for all using(public.commerce_has_permission('orders.write')) with check(public.commerce_has_permission('orders.write'));
drop policy if exists "commerce staff order items" on public.commerce_order_items;
create policy "commerce staff order items" on public.commerce_order_items for select using(public.commerce_has_permission('orders.write'));
drop policy if exists "commerce staff shipments" on public.commerce_shipments;
create policy "commerce staff shipments" on public.commerce_shipments for all using(public.commerce_has_permission('orders.write')) with check(public.commerce_has_permission('orders.write'));
drop policy if exists "commerce staff customers" on public.commerce_customers;
create policy "commerce staff customers" on public.commerce_customers for all using(public.commerce_has_permission('customers.write')) with check(public.commerce_has_permission('customers.write'));
drop policy if exists "commerce staff customer activities" on public.commerce_customer_activities;
create policy "commerce staff customer activities" on public.commerce_customer_activities for all using(public.commerce_has_permission('customers.write')) with check(public.commerce_has_permission('customers.write'));
drop policy if exists "commerce staff finance payments" on public.commerce_payments;
create policy "commerce staff finance payments" on public.commerce_payments for select using(public.commerce_has_permission('finance.write') or public.commerce_has_permission('orders.write'));
drop policy if exists "commerce staff finance refunds" on public.commerce_refunds;
create policy "commerce staff finance refunds" on public.commerce_refunds for select using(public.commerce_has_permission('finance.write') or public.commerce_has_permission('orders.write'));
drop policy if exists "commerce staff settings" on public.commerce_settings;
create policy "commerce staff settings" on public.commerce_settings for update using(public.commerce_has_permission('settings.write')) with check(public.commerce_has_permission('settings.write'));

-- Customers can request a return only for their own order.
drop policy if exists "commerce return customer insert" on public.commerce_returns;
create policy "commerce return customer insert" on public.commerce_returns for insert with check(
 customer_id in(select id from public.commerce_customers where auth_user_id=auth.uid())
 and order_id in(select o.id from public.commerce_orders o join public.commerce_customers c on c.id=o.customer_id where c.auth_user_id=auth.uid())
);
drop policy if exists "commerce return customer read" on public.commerce_returns;
create policy "commerce return customer read" on public.commerce_returns for select using(
 customer_id in(select id from public.commerce_customers where auth_user_id=auth.uid())
);

-- Entitled customers may read digital file metadata; Storage remains private and signed-URL-only.
drop policy if exists "commerce digital files entitled read" on public.commerce_digital_files;
create policy "commerce digital files entitled read" on public.commerce_digital_files for select using(
 active and product_id in(
   select e.product_id from public.commerce_digital_entitlements e
   join public.commerce_customers c on c.id=e.customer_id
   where c.auth_user_id=auth.uid() and e.revoked_at is null and (e.expires_at is null or e.expires_at>now())
 )
);
