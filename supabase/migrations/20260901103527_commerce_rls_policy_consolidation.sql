-- Consolidate overlapping commerce RLS policies without changing intended access.
-- Public storefront reads stay public; authenticated staff/customer access is explicit.

-- Categories
DROP POLICY IF EXISTS "commerce admin categories" ON public.commerce_categories;
DROP POLICY IF EXISTS "commerce staff catalog categories" ON public.commerce_categories;
DROP POLICY IF EXISTS "commerce public categories" ON public.commerce_categories;
CREATE POLICY "commerce public categories" ON public.commerce_categories FOR SELECT TO anon, authenticated USING (active OR commerce_has_permission('catalog.write'));
CREATE POLICY "commerce staff categories write" ON public.commerce_categories FOR INSERT TO authenticated WITH CHECK (commerce_has_permission('catalog.write'));
CREATE POLICY "commerce staff categories update" ON public.commerce_categories FOR UPDATE TO authenticated USING (commerce_has_permission('catalog.write')) WITH CHECK (commerce_has_permission('catalog.write'));
CREATE POLICY "commerce staff categories delete" ON public.commerce_categories FOR DELETE TO authenticated USING (commerce_has_permission('catalog.write'));

-- Products
DROP POLICY IF EXISTS "commerce admin products" ON public.commerce_products;
DROP POLICY IF EXISTS "commerce staff catalog products" ON public.commerce_products;
DROP POLICY IF EXISTS "commerce public products" ON public.commerce_products;
CREATE POLICY "commerce public products" ON public.commerce_products FOR SELECT TO anon, authenticated USING (active OR commerce_has_permission('catalog.write'));
CREATE POLICY "commerce staff products insert" ON public.commerce_products FOR INSERT TO authenticated WITH CHECK (commerce_has_permission('catalog.write'));
CREATE POLICY "commerce staff products update" ON public.commerce_products FOR UPDATE TO authenticated USING (commerce_has_permission('catalog.write')) WITH CHECK (commerce_has_permission('catalog.write'));
CREATE POLICY "commerce staff products delete" ON public.commerce_products FOR DELETE TO authenticated USING (commerce_has_permission('catalog.write'));

-- Variants
DROP POLICY IF EXISTS "commerce admin variants" ON public.commerce_product_variants;
DROP POLICY IF EXISTS "commerce staff catalog variants" ON public.commerce_product_variants;
DROP POLICY IF EXISTS "commerce public variants" ON public.commerce_product_variants;
CREATE POLICY "commerce public variants" ON public.commerce_product_variants FOR SELECT TO anon, authenticated USING (active OR commerce_has_permission('catalog.write'));
CREATE POLICY "commerce staff variants insert" ON public.commerce_product_variants FOR INSERT TO authenticated WITH CHECK (commerce_has_permission('catalog.write'));
CREATE POLICY "commerce staff variants update" ON public.commerce_product_variants FOR UPDATE TO authenticated USING (commerce_has_permission('catalog.write')) WITH CHECK (commerce_has_permission('catalog.write'));
CREATE POLICY "commerce staff variants delete" ON public.commerce_product_variants FOR DELETE TO authenticated USING (commerce_has_permission('catalog.write'));

-- Customers
DROP POLICY IF EXISTS "commerce admin customers" ON public.commerce_customers;
DROP POLICY IF EXISTS "commerce staff customers" ON public.commerce_customers;
DROP POLICY IF EXISTS "commerce customer self insert" ON public.commerce_customers;
DROP POLICY IF EXISTS "commerce customer self" ON public.commerce_customers;
DROP POLICY IF EXISTS "commerce customer self update" ON public.commerce_customers;
CREATE POLICY "commerce customers read" ON public.commerce_customers FOR SELECT TO authenticated USING (auth.uid() = auth_user_id OR commerce_has_permission('customers.write'));
CREATE POLICY "commerce customers insert" ON public.commerce_customers FOR INSERT TO authenticated WITH CHECK (auth.uid() = auth_user_id OR commerce_has_permission('customers.write'));
CREATE POLICY "commerce customers update" ON public.commerce_customers FOR UPDATE TO authenticated USING (auth.uid() = auth_user_id OR commerce_has_permission('customers.write')) WITH CHECK (auth.uid() = auth_user_id OR commerce_has_permission('customers.write'));
CREATE POLICY "commerce customers delete" ON public.commerce_customers FOR DELETE TO authenticated USING (commerce_has_permission('customers.write'));

-- Orders and items
DROP POLICY IF EXISTS "commerce admin orders" ON public.commerce_orders;
DROP POLICY IF EXISTS "commerce staff orders" ON public.commerce_orders;
DROP POLICY IF EXISTS "commerce order self read" ON public.commerce_orders;
CREATE POLICY "commerce orders read" ON public.commerce_orders FOR SELECT TO authenticated USING (commerce_has_permission('orders.write') OR customer_id IN (SELECT id FROM public.commerce_customers WHERE auth_user_id = auth.uid()));
CREATE POLICY "commerce orders staff insert" ON public.commerce_orders FOR INSERT TO authenticated WITH CHECK (commerce_has_permission('orders.write'));
CREATE POLICY "commerce orders staff update" ON public.commerce_orders FOR UPDATE TO authenticated USING (commerce_has_permission('orders.write')) WITH CHECK (commerce_has_permission('orders.write'));
CREATE POLICY "commerce orders staff delete" ON public.commerce_orders FOR DELETE TO authenticated USING (commerce_has_permission('orders.write'));

DROP POLICY IF EXISTS "commerce admin order items" ON public.commerce_order_items;
DROP POLICY IF EXISTS "commerce order item self read" ON public.commerce_order_items;
DROP POLICY IF EXISTS "commerce staff order items" ON public.commerce_order_items;
CREATE POLICY "commerce order items read" ON public.commerce_order_items FOR SELECT TO authenticated USING (commerce_has_permission('orders.write') OR order_id IN (SELECT o.id FROM public.commerce_orders o JOIN public.commerce_customers c ON c.id=o.customer_id WHERE c.auth_user_id=auth.uid()));
CREATE POLICY "commerce order items staff insert" ON public.commerce_order_items FOR INSERT TO authenticated WITH CHECK (commerce_has_permission('orders.write'));
CREATE POLICY "commerce order items staff update" ON public.commerce_order_items FOR UPDATE TO authenticated USING (commerce_has_permission('orders.write')) WITH CHECK (commerce_has_permission('orders.write'));
CREATE POLICY "commerce order items staff delete" ON public.commerce_order_items FOR DELETE TO authenticated USING (commerce_has_permission('orders.write'));

-- Service jobs/files
DROP POLICY IF EXISTS "commerce service job staff write" ON public.commerce_service_jobs;
DROP POLICY IF EXISTS "commerce service job self" ON public.commerce_service_jobs;
CREATE POLICY "commerce service jobs read" ON public.commerce_service_jobs FOR SELECT TO authenticated USING (commerce_has_permission('orders.write') OR customer_id IN (SELECT id FROM public.commerce_customers WHERE auth_user_id=auth.uid()));
CREATE POLICY "commerce service jobs insert" ON public.commerce_service_jobs FOR INSERT TO authenticated WITH CHECK (commerce_has_permission('orders.write'));
CREATE POLICY "commerce service jobs update" ON public.commerce_service_jobs FOR UPDATE TO authenticated USING (commerce_has_permission('orders.write')) WITH CHECK (commerce_has_permission('orders.write'));
CREATE POLICY "commerce service jobs delete" ON public.commerce_service_jobs FOR DELETE TO authenticated USING (commerce_has_permission('orders.write'));

DROP POLICY IF EXISTS "commerce service files staff" ON public.commerce_service_files;
DROP POLICY IF EXISTS "commerce service files self" ON public.commerce_service_files;
CREATE POLICY "commerce service files read" ON public.commerce_service_files FOR SELECT TO authenticated USING (commerce_has_permission('orders.write') OR (visibility='customer' AND service_job_id IN (SELECT j.id FROM public.commerce_service_jobs j JOIN public.commerce_customers c ON c.id=j.customer_id WHERE c.auth_user_id=auth.uid())));
CREATE POLICY "commerce service files insert" ON public.commerce_service_files FOR INSERT TO authenticated WITH CHECK (commerce_has_permission('orders.write'));
CREATE POLICY "commerce service files update" ON public.commerce_service_files FOR UPDATE TO authenticated USING (commerce_has_permission('orders.write')) WITH CHECK (commerce_has_permission('orders.write'));
CREATE POLICY "commerce service files delete" ON public.commerce_service_files FOR DELETE TO authenticated USING (commerce_has_permission('orders.write'));

-- Settings
DROP POLICY IF EXISTS "commerce admin settings" ON public.commerce_settings;
DROP POLICY IF EXISTS "commerce public settings" ON public.commerce_settings;
DROP POLICY IF EXISTS "commerce staff settings" ON public.commerce_settings;
CREATE POLICY "commerce public settings" ON public.commerce_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "commerce staff settings insert" ON public.commerce_settings FOR INSERT TO authenticated WITH CHECK (commerce_has_permission('settings.write'));
CREATE POLICY "commerce staff settings update" ON public.commerce_settings FOR UPDATE TO authenticated USING (commerce_has_permission('settings.write')) WITH CHECK (commerce_has_permission('settings.write'));
CREATE POLICY "commerce staff settings delete" ON public.commerce_settings FOR DELETE TO authenticated USING (commerce_has_permission('settings.write'));

-- Reviews
DROP POLICY IF EXISTS "commerce admin reviews" ON public.commerce_reviews;
DROP POLICY IF EXISTS "commerce public approved reviews" ON public.commerce_reviews;
DROP POLICY IF EXISTS "commerce review self read" ON public.commerce_reviews;
DROP POLICY IF EXISTS "commerce review insert self" ON public.commerce_reviews;
CREATE POLICY "commerce reviews read" ON public.commerce_reviews FOR SELECT TO anon, authenticated USING (status='approved' OR (auth.uid() IS NOT NULL AND customer_id IN (SELECT id FROM public.commerce_customers WHERE auth_user_id=auth.uid())) OR commerce_has_permission('catalog.write'));
CREATE POLICY "commerce reviews insert self" ON public.commerce_reviews FOR INSERT TO authenticated WITH CHECK (customer_id IN (SELECT id FROM public.commerce_customers WHERE auth_user_id=auth.uid()));
CREATE POLICY "commerce reviews staff update" ON public.commerce_reviews FOR UPDATE TO authenticated USING (commerce_has_permission('catalog.write')) WITH CHECK (commerce_has_permission('catalog.write'));
CREATE POLICY "commerce reviews staff delete" ON public.commerce_reviews FOR DELETE TO authenticated USING (commerce_has_permission('catalog.write'));

-- Explicit roles
ALTER POLICY "commerce public branches" ON public.commerce_branches TO anon, authenticated;
ALTER POLICY "commerce staff branches" ON public.commerce_branches TO authenticated;
ALTER POLICY "commerce catalog digital files" ON public.commerce_digital_files TO authenticated;
ALTER POLICY "commerce digital files entitled read" ON public.commerce_digital_files TO authenticated;
ALTER POLICY "commerce entitlement self" ON public.commerce_digital_entitlements TO authenticated;
ALTER POLICY "commerce wishlist self" ON public.commerce_wishlists TO authenticated;
ALTER POLICY "commerce return customer insert" ON public.commerce_returns TO authenticated;
ALTER POLICY "commerce return customer read" ON public.commerce_returns TO authenticated;
ALTER POLICY "commerce returns items customer insert" ON public.commerce_returns_items TO authenticated;
ALTER POLICY "commerce returns items self" ON public.commerce_returns_items TO authenticated;
ALTER POLICY "commerce staff roles admin" ON public.commerce_staff_roles TO authenticated;
ALTER POLICY "commerce staff roles read" ON public.commerce_staff_roles TO authenticated;
