-- A Solution Commerce production schema (namespaced to avoid collisions with the existing company CRM)
create extension if not exists pgcrypto;

create table if not exists public.commerce_settings(
 id uuid primary key default gen_random_uuid(), singleton boolean unique not null default true,
 store_name text not null default 'A Solution', store_name_ar text not null default 'A Solution',
 logo_url text, favicon_url text, accent text not null default '#ff5a4e', paper text not null default '#f2efe8', ink text not null default '#111111',
 currency text not null default 'SAR', vat_rate numeric(5,4) not null default .15,
 contact_email text, contact_phone text, whatsapp text, instagram text, default_locale text not null default 'en',
 payment_provider text not null default 'invoice', shipping_provider text, updated_at timestamptz not null default now()
);
create table if not exists public.commerce_categories(
 id uuid primary key default gen_random_uuid(), slug text unique not null, name_en text not null, name_ar text not null,
 active boolean not null default true, sort_order int not null default 0, created_at timestamptz not null default now()
);
create table if not exists public.commerce_products(
 id uuid primary key default gen_random_uuid(), slug text unique not null, sku text unique, type text not null default 'service' check(type in ('service','physical','digital')),
 category_id uuid references public.commerce_categories(id) on delete set null,
 name_en text not null, name_ar text not null, eyebrow_en text, eyebrow_ar text,
 description_en text not null default '', description_ar text not null default '', features_en jsonb not null default '[]', features_ar jsonb not null default '[]',
 price numeric(12,2) not null check(price>=0), compare_at_price numeric(12,2), inventory_qty int, track_inventory boolean not null default false,
 featured boolean not null default false, active boolean not null default true, seo_title_en text, seo_title_ar text, seo_description_en text, seo_description_ar text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.commerce_product_variants(
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.commerce_products(id) on delete cascade,
 sku text unique, name_en text not null, name_ar text not null, price numeric(12,2), inventory_qty int, active boolean not null default true,
 attributes jsonb not null default '{}'
);
create table if not exists public.commerce_customers(
 id uuid primary key default gen_random_uuid(), auth_user_id uuid unique references auth.users(id) on delete set null,
 crm_customer_id bigint references public.customers(id) on delete set null,
 email text, phone text, name text, company text, locale text not null default 'en', source text, tags text[] not null default '{}',
 lifetime_value numeric(12,2) not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index if not exists commerce_customers_email_unique on public.commerce_customers(lower(email)) where email is not null;
create table if not exists public.commerce_addresses(
 id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.commerce_customers(id) on delete cascade,
 label text, city text not null, address_line text, country text not null default 'SA', is_default boolean not null default false
);
create table if not exists public.commerce_orders(
 id uuid primary key default gen_random_uuid(), order_number text unique not null, customer_id uuid references public.commerce_customers(id) on delete set null,
 email text not null, phone text, name text not null, company text, city text, address_line text,
 currency text not null default 'SAR', subtotal numeric(12,2) not null, discount numeric(12,2) not null default 0,
 vat numeric(12,2) not null default 0, shipping numeric(12,2) not null default 0, total numeric(12,2) not null,
 coupon_code text, payment_method text not null default 'invoice', payment_status text not null default 'unpaid' check(payment_status in('unpaid','pending','paid','partially_refunded','refunded','failed')),
 fulfillment_status text not null default 'unfulfilled' check(fulfillment_status in('unfulfilled','processing','fulfilled','cancelled','returned')),
 notes text, source text, medium text, campaign text, metadata jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.commerce_order_items(
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.commerce_orders(id) on delete cascade,
 product_id uuid references public.commerce_products(id) on delete set null, variant_id uuid references public.commerce_product_variants(id) on delete set null,
 name text not null, sku text, unit_price numeric(12,2) not null, quantity int not null check(quantity>0), line_total numeric(12,2) not null
);
create table if not exists public.commerce_payments(
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.commerce_orders(id) on delete cascade,
 provider text not null, provider_reference text, amount numeric(12,2) not null, status text not null default 'pending',
 idempotency_key text unique, payload jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.commerce_shipments(
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.commerce_orders(id) on delete cascade,
 provider text, tracking_number text, tracking_url text, status text not null default 'pending', shipped_at timestamptz, delivered_at timestamptz
);
create table if not exists public.commerce_returns(
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.commerce_orders(id) on delete cascade,
 customer_id uuid references public.commerce_customers(id) on delete set null, reason text, status text not null default 'requested', amount numeric(12,2), created_at timestamptz not null default now()
);
create table if not exists public.commerce_refunds(
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.commerce_orders(id) on delete cascade,
 payment_id uuid references public.commerce_payments(id) on delete set null, amount numeric(12,2) not null check(amount>0), reason text,
 status text not null default 'pending', created_at timestamptz not null default now()
);
create table if not exists public.commerce_coupons(
 id uuid primary key default gen_random_uuid(), code text unique not null, kind text not null check(kind in('fixed','percent')), value numeric(12,2) not null check(value>0),
 minimum_subtotal numeric(12,2) not null default 0, starts_at timestamptz, ends_at timestamptz, max_uses int, uses int not null default 0,
 active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.commerce_wishlists(
 id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.commerce_customers(id) on delete cascade,
 product_id uuid not null references public.commerce_products(id) on delete cascade, created_at timestamptz not null default now(), unique(customer_id,product_id)
);
create table if not exists public.commerce_reviews(
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.commerce_products(id) on delete cascade,
 customer_id uuid references public.commerce_customers(id) on delete set null, rating int not null check(rating between 1 and 5), title text, body text,
 status text not null default 'pending' check(status in('pending','approved','rejected')), created_at timestamptz not null default now()
);
create table if not exists public.commerce_customer_activities(
 id uuid primary key default gen_random_uuid(), customer_id uuid references public.commerce_customers(id) on delete cascade,
 activity_type text not null, note text, metadata jsonb not null default '{}', created_at timestamptz not null default now()
);
create table if not exists public.commerce_abandoned_carts(
 id uuid primary key default gen_random_uuid(), customer_id uuid references public.commerce_customers(id) on delete set null,
 email text, session_key text, items jsonb not null default '[]', estimated_total numeric(12,2) not null default 0,
 recovered_order_id uuid references public.commerce_orders(id) on delete set null, last_seen_at timestamptz not null default now(), created_at timestamptz not null default now()
);
create table if not exists public.commerce_audit_logs(
 id bigint generated always as identity primary key, actor_id uuid references auth.users(id) on delete set null,
 action text not null, entity_type text not null, entity_id text, before_data jsonb, after_data jsonb, created_at timestamptz not null default now()
);

create or replace function public.commerce_is_admin() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.profiles where id=auth.uid() and role='admin')
$$;

alter table public.commerce_settings enable row level security; alter table public.commerce_categories enable row level security; alter table public.commerce_products enable row level security;
alter table public.commerce_product_variants enable row level security; alter table public.commerce_customers enable row level security; alter table public.commerce_addresses enable row level security;
alter table public.commerce_orders enable row level security; alter table public.commerce_order_items enable row level security; alter table public.commerce_payments enable row level security;
alter table public.commerce_shipments enable row level security; alter table public.commerce_returns enable row level security; alter table public.commerce_refunds enable row level security;
alter table public.commerce_coupons enable row level security; alter table public.commerce_wishlists enable row level security; alter table public.commerce_reviews enable row level security;
alter table public.commerce_customer_activities enable row level security; alter table public.commerce_abandoned_carts enable row level security; alter table public.commerce_audit_logs enable row level security;

create policy "commerce public settings" on public.commerce_settings for select using(true);
create policy "commerce public categories" on public.commerce_categories for select using(active);
create policy "commerce public products" on public.commerce_products for select using(active);
create policy "commerce public variants" on public.commerce_product_variants for select using(active);
create policy "commerce public approved reviews" on public.commerce_reviews for select using(status='approved');

create policy "commerce customer self" on public.commerce_customers for select using(auth.uid()=auth_user_id or public.commerce_is_admin());
create policy "commerce customer self update" on public.commerce_customers for update using(auth.uid()=auth_user_id or public.commerce_is_admin()) with check(auth.uid()=auth_user_id or public.commerce_is_admin());
create policy "commerce addresses self" on public.commerce_addresses for all using(public.commerce_is_admin() or customer_id in(select id from public.commerce_customers where auth_user_id=auth.uid())) with check(public.commerce_is_admin() or customer_id in(select id from public.commerce_customers where auth_user_id=auth.uid()));
create policy "commerce order self read" on public.commerce_orders for select using(public.commerce_is_admin() or customer_id in(select id from public.commerce_customers where auth_user_id=auth.uid()));
create policy "commerce order item self read" on public.commerce_order_items for select using(public.commerce_is_admin() or order_id in(select o.id from public.commerce_orders o join public.commerce_customers c on c.id=o.customer_id where c.auth_user_id=auth.uid()));
create policy "commerce wishlist self" on public.commerce_wishlists for all using(public.commerce_is_admin() or customer_id in(select id from public.commerce_customers where auth_user_id=auth.uid())) with check(public.commerce_is_admin() or customer_id in(select id from public.commerce_customers where auth_user_id=auth.uid()));
create policy "commerce review insert self" on public.commerce_reviews for insert with check(customer_id in(select id from public.commerce_customers where auth_user_id=auth.uid()));
create policy "commerce review self read" on public.commerce_reviews for select using(status='approved' or public.commerce_is_admin() or customer_id in(select id from public.commerce_customers where auth_user_id=auth.uid()));

create policy "commerce admin settings" on public.commerce_settings for all using(public.commerce_is_admin()) with check(public.commerce_is_admin());
create policy "commerce admin categories" on public.commerce_categories for all using(public.commerce_is_admin()) with check(public.commerce_is_admin());
create policy "commerce admin products" on public.commerce_products for all using(public.commerce_is_admin()) with check(public.commerce_is_admin());
create policy "commerce admin variants" on public.commerce_product_variants for all using(public.commerce_is_admin()) with check(public.commerce_is_admin());
create policy "commerce admin customers" on public.commerce_customers for all using(public.commerce_is_admin()) with check(public.commerce_is_admin());
create policy "commerce admin orders" on public.commerce_orders for all using(public.commerce_is_admin()) with check(public.commerce_is_admin());
create policy "commerce admin order items" on public.commerce_order_items for all using(public.commerce_is_admin()) with check(public.commerce_is_admin());
create policy "commerce admin payments" on public.commerce_payments for all using(public.commerce_is_admin()) with check(public.commerce_is_admin());
create policy "commerce admin shipments" on public.commerce_shipments for all using(public.commerce_is_admin()) with check(public.commerce_is_admin());
create policy "commerce admin returns" on public.commerce_returns for all using(public.commerce_is_admin()) with check(public.commerce_is_admin());
create policy "commerce admin refunds" on public.commerce_refunds for all using(public.commerce_is_admin()) with check(public.commerce_is_admin());
create policy "commerce admin coupons" on public.commerce_coupons for all using(public.commerce_is_admin()) with check(public.commerce_is_admin());
create policy "commerce admin reviews" on public.commerce_reviews for all using(public.commerce_is_admin()) with check(public.commerce_is_admin());
create policy "commerce admin activities" on public.commerce_customer_activities for all using(public.commerce_is_admin()) with check(public.commerce_is_admin());
create policy "commerce admin abandoned carts" on public.commerce_abandoned_carts for all using(public.commerce_is_admin()) with check(public.commerce_is_admin());
create policy "commerce admin audit" on public.commerce_audit_logs for select using(public.commerce_is_admin());

create index if not exists commerce_products_active_category_idx on public.commerce_products(active,category_id);
create index if not exists commerce_orders_created_idx on public.commerce_orders(created_at desc);
create index if not exists commerce_orders_customer_idx on public.commerce_orders(customer_id,created_at desc);
create index if not exists commerce_orders_status_idx on public.commerce_orders(payment_status,fulfillment_status);
create index if not exists commerce_activities_customer_idx on public.commerce_customer_activities(customer_id,created_at desc);

insert into public.commerce_settings(singleton,contact_email,contact_phone,payment_provider)
values(true,'hello@alameensolution.site',null,'invoice') on conflict(singleton) do nothing;

insert into public.commerce_categories(slug,name_en,name_ar,sort_order) values
 ('digital','Digital','رقمي',1),('creative','Creative','إبداع',2),('marketing','Marketing','تسويق',3),('technology','Technology','تقنية',4)
on conflict(slug) do update set name_en=excluded.name_en,name_ar=excluded.name_ar,sort_order=excluded.sort_order;

with c as (select id,slug from public.commerce_categories)
insert into public.commerce_products(slug,sku,type,category_id,name_en,name_ar,eyebrow_en,eyebrow_ar,description_en,description_ar,features_en,features_ar,price,featured)
select * from (values
 ('web-launch','AS-WEB','service',(select id from c where slug='digital'),'Website Launch System','نظام إطلاق موقع احترافي','WEB × DIGITAL','ويب × رقمي','Strategy, UX direction, responsive build and launch for a distinctive business website.','استراتيجية وتجربة مستخدم وتطوير متجاوب وإطلاق لموقع أعمال مميز.','["Strategy & structure","Responsive build","SEO foundation","Launch support"]'::jsonb,'["الاستراتيجية والهيكلة","تطوير متجاوب","تهيئة SEO","دعم الإطلاق"]'::jsonb,8900::numeric,true),
 ('commerce','AS-COM','service',(select id from c where slug='digital'),'Commerce Experience','تجربة متجر إلكتروني','COMMERCE × SYSTEMS','تجارة × أنظمة','A premium bilingual commerce experience with catalog, cart, checkout and operations.','تجربة تجارة إلكترونية فاخرة ثنائية اللغة تشمل الكتالوج والسلة والدفع والتشغيل.','["Arabic + English","Catalog & cart","Checkout flow","Admin operations"]'::jsonb,'["عربي + إنجليزي","كتالوج وسلة","مسار شراء","إدارة التشغيل"]'::jsonb,12500::numeric,true),
 ('brand-system','AS-BRAND','service',(select id from c where slug='creative'),'Brand Identity System','نظام هوية بصرية','BRAND × CREATIVE','هوية × إبداع','A coherent visual system built to make the business recognizable everywhere.','نظام بصري مترابط يجعل العلامة واضحة وقابلة للتطبيق في كل نقطة تواصل.','["Creative direction","Identity system","Brand applications","Launch toolkit"]'::jsonb,'["توجيه إبداعي","نظام الهوية","تطبيقات العلامة","حزمة الإطلاق"]'::jsonb,6000::numeric,true),
 ('growth','AS-GROW','service',(select id from c where slug='marketing'),'Growth Campaign','حملة نمو وتسويق','MARKETING × PERFORMANCE','تسويق × أداء','Campaign strategy, creative production and performance setup built around measurable demand.','استراتيجية وإنتاج إبداعي وإعداد حملات أداء مصممة حول طلب قابل للقياس.','["Campaign strategy","Creative system","Paid media setup","Reporting"]'::jsonb,'["استراتيجية الحملة","نظام إبداعي","إعداد الإعلانات","تقارير"]'::jsonb,8500::numeric,true),
 ('crm','AS-CRM','service',(select id from c where slug='technology'),'CRM & Operations System','نظام CRM وتشغيل','TECH × BUSINESS','تقنية × أعمال','A connected customer, sales and operations workspace shaped around your workflow.','مساحة مترابطة للعملاء والمبيعات والتشغيل مصممة حسب سير عمل الشركة.','["CRM pipeline","Customers","Tasks & follow-ups","Management reporting"]'::jsonb,'["مسار مبيعات","العملاء","مهام ومتابعات","تقارير الإدارة"]'::jsonb,15000::numeric,false),
 ('social','AS-SOC','service',(select id from c where slug='marketing'),'Social Content System','نظام محتوى سوشيال','CONTENT × SOCIAL','محتوى × سوشيال','Monthly content direction, production framework and publishing system.','توجيه محتوى شهري وإطار إنتاج ونظام نشر ومراجعة أداء.','["Content strategy","Monthly calendar","Creative direction","Performance review"]'::jsonb,'["استراتيجية محتوى","تقويم شهري","توجيه إبداعي","مراجعة الأداء"]'::jsonb,4500::numeric,false)
) as v(slug,sku,type,category_id,name_en,name_ar,eyebrow_en,eyebrow_ar,description_en,description_ar,features_en,features_ar,price,featured)
on conflict(slug) do update set sku=excluded.sku,category_id=excluded.category_id,name_en=excluded.name_en,name_ar=excluded.name_ar,eyebrow_en=excluded.eyebrow_en,eyebrow_ar=excluded.eyebrow_ar,description_en=excluded.description_en,description_ar=excluded.description_ar,features_en=excluded.features_en,features_ar=excluded.features_ar,price=excluded.price,featured=excluded.featured,updated_at=now();
