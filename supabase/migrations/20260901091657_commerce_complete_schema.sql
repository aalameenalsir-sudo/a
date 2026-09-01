-- A Solution Commerce complete-platform additive migration.
-- Forward-only: safe for existing commerce_* production data.

alter table public.commerce_settings
  add column if not exists company_name text,
  add column if not exists company_name_ar text,
  add column if not exists font_family text default 'Manrope',
  add column if not exists font_family_ar text default 'Alexandria',
  add column if not exists enabled_locales text[] not null default array['en','ar'],
  add column if not exists tax_number text,
  add column if not exists commercial_registration text,
  add column if not exists bank_name text,
  add column if not exists bank_beneficiary text,
  add column if not exists bank_iban text,
  add column if not exists bank_account_number text,
  add column if not exists enabled_payment_methods text[] not null default array['invoice','bank_transfer'],
  add column if not exists cod_enabled boolean not null default false,
  add column if not exists pickup_enabled boolean not null default false,
  add column if not exists flat_shipping_rate numeric(12,2) not null default 0 check(flat_shipping_rate>=0),
  add column if not exists free_shipping_threshold numeric(12,2),
  add column if not exists facebook text,
  add column if not exists linkedin text,
  add column if not exists tiktok text,
  add column if not exists x_url text,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists return_policy text,
  add column if not exists privacy_policy text,
  add column if not exists terms_policy text,
  add column if not exists invoice_footer text;

alter table public.commerce_products
  add column if not exists low_stock_threshold int not null default 5 check(low_stock_threshold>=0),
  add column if not exists weight_kg numeric(10,3),
  add column if not exists length_cm numeric(10,2),
  add column if not exists width_cm numeric(10,2),
  add column if not exists height_cm numeric(10,2),
  add column if not exists shipping_required boolean not null default false,
  add column if not exists pickup_allowed boolean not null default false,
  add column if not exists cod_allowed boolean not null default false,
  add column if not exists returnable boolean not null default true,
  add column if not exists download_limit int,
  add column if not exists download_expiry_hours int,
  add column if not exists service_duration_minutes int,
  add column if not exists service_requires_appointment boolean not null default false,
  add column if not exists service_requirements jsonb not null default '[]'::jsonb,
  add column if not exists status text not null default 'active' check(status in('draft','active','archived')),
  add column if not exists gallery jsonb not null default '[]'::jsonb;

update public.commerce_products set shipping_required=true where type='physical' and shipping_required=false;
update public.commerce_products set cod_allowed=false where type<>'physical';

alter table public.commerce_orders
  add column if not exists order_status text not null default 'open' check(order_status in('open','confirmed','completed','cancelled')),
  add column if not exists idempotency_key text,
  add column if not exists public_token uuid not null default gen_random_uuid(),
  add column if not exists shipping_method text,
  add column if not exists shipping_provider text,
  add column if not exists pickup_branch_id uuid,
  add column if not exists paid_at timestamptz,
  add column if not exists cancelled_at timestamptz;
create unique index if not exists commerce_orders_idempotency_unique on public.commerce_orders(idempotency_key) where idempotency_key is not null;
create unique index if not exists commerce_orders_public_token_unique on public.commerce_orders(public_token);

alter table public.commerce_order_items
  add column if not exists product_type text check(product_type in('service','physical','digital')),
  add column if not exists metadata jsonb not null default '{}'::jsonb;
update public.commerce_order_items i set product_type=p.type from public.commerce_products p where i.product_id=p.id and i.product_type is null;

create table if not exists public.commerce_branches(
 id uuid primary key default gen_random_uuid(),
 code text unique not null,
 name_en text not null,
 name_ar text not null,
 city text,
 address_line text,
 phone text,
 active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.commerce_digital_files(
 id uuid primary key default gen_random_uuid(),
 product_id uuid not null references public.commerce_products(id) on delete cascade,
 label text not null,
 storage_path text not null,
 version text,
 active boolean not null default true,
 created_at timestamptz not null default now()
);

create table if not exists public.commerce_digital_entitlements(
 id uuid primary key default gen_random_uuid(),
 order_item_id uuid not null references public.commerce_order_items(id) on delete cascade,
 customer_id uuid references public.commerce_customers(id) on delete set null,
 product_id uuid references public.commerce_products(id) on delete set null,
 expires_at timestamptz,
 max_downloads int,
 download_count int not null default 0,
 revoked_at timestamptz,
 created_at timestamptz not null default now(),
 unique(order_item_id)
);

create table if not exists public.commerce_service_jobs(
 id uuid primary key default gen_random_uuid(),
 order_item_id uuid not null unique references public.commerce_order_items(id) on delete cascade,
 customer_id uuid references public.commerce_customers(id) on delete set null,
 product_id uuid references public.commerce_products(id) on delete set null,
 assigned_user_id uuid references auth.users(id) on delete set null,
 status text not null default 'new' check(status in('new','requirements','scheduled','in_progress','review','delivered','completed','cancelled')),
 appointment_at timestamptz,
 requirements jsonb not null default '{}'::jsonb,
 internal_notes text,
 customer_notes text,
 delivery_notes text,
 delivered_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.commerce_service_files(
 id uuid primary key default gen_random_uuid(),
 service_job_id uuid not null references public.commerce_service_jobs(id) on delete cascade,
 visibility text not null default 'customer' check(visibility in('internal','customer')),
 label text,
 storage_path text not null,
 uploaded_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now()
);

create table if not exists public.commerce_staff_roles(
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null check(role in('owner','admin','store_manager','sales_crm','fulfillment','finance','marketing','support','viewer')),
 active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.commerce_returns_items(
 id uuid primary key default gen_random_uuid(),
 return_id uuid not null references public.commerce_returns(id) on delete cascade,
 order_item_id uuid not null references public.commerce_order_items(id) on delete restrict,
 quantity int not null check(quantity>0),
 reason text,
 resolution text check(resolution in('refund','exchange','store_credit')),
 created_at timestamptz not null default now()
);

create table if not exists public.commerce_automation_rules(
 id uuid primary key default gen_random_uuid(),
 event_type text not null,
 name text not null,
 enabled boolean not null default true,
 conditions jsonb not null default '{}'::jsonb,
 actions jsonb not null default '[]'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.commerce_automation_events(
 id bigint generated always as identity primary key,
 event_type text not null,
 entity_type text,
 entity_id text,
 payload jsonb not null default '{}'::jsonb,
 processed_at timestamptz,
 error text,
 created_at timestamptz not null default now()
);

create table if not exists public.commerce_notification_templates(
 id uuid primary key default gen_random_uuid(),
 template_key text not null,
 locale text not null default 'en',
 channel text not null check(channel in('email','sms','whatsapp')),
 subject text,
 body text not null,
 active boolean not null default true,
 updated_at timestamptz not null default now(),
 unique(template_key,locale,channel)
);
