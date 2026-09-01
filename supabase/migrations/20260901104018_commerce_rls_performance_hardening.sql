-- Consolidate remaining overlapping commerce policies and cache auth.uid() per statement.
DROP POLICY IF EXISTS "commerce public branches" ON public.commerce_branches;
DROP POLICY IF EXISTS "commerce staff branches" ON public.commerce_branches;
CREATE POLICY "commerce branches read" ON public.commerce_branches FOR SELECT TO anon,authenticated USING (active OR commerce_has_permission('settings.write'));
CREATE POLICY "commerce branches insert" ON public.commerce_branches FOR INSERT TO authenticated WITH CHECK (commerce_has_permission('settings.write'));
CREATE POLICY "commerce branches update" ON public.commerce_branches FOR UPDATE TO authenticated USING (commerce_has_permission('settings.write')) WITH CHECK (commerce_has_permission('settings.write'));
CREATE POLICY "commerce branches delete" ON public.commerce_branches FOR DELETE TO authenticated USING (commerce_has_permission('settings.write'));

DROP POLICY IF EXISTS "commerce admin activities" ON public.commerce_customer_activities;
DROP POLICY IF EXISTS "commerce staff customer activities" ON public.commerce_customer_activities;
CREATE POLICY "commerce customer activities staff" ON public.commerce_customer_activities FOR ALL TO authenticated USING (commerce_has_permission('customers.write')) WITH CHECK (commerce_has_permission('customers.write'));

DROP POLICY IF EXISTS "commerce catalog digital files" ON public.commerce_digital_files;
DROP POLICY IF EXISTS "commerce digital files entitled read" ON public.commerce_digital_files;
CREATE POLICY "commerce digital files read" ON public.commerce_digital_files FOR SELECT TO authenticated USING (commerce_has_permission('catalog.write') OR (active AND product_id IN (SELECT e.product_id FROM commerce_digital_entitlements e JOIN commerce_customers c ON c.id=e.customer_id WHERE c.auth_user_id=(select auth.uid()) AND e.revoked_at IS NULL AND (e.expires_at IS NULL OR e.expires_at>now()))));
CREATE POLICY "commerce digital files insert" ON public.commerce_digital_files FOR INSERT TO authenticated WITH CHECK (commerce_has_permission('catalog.write'));
CREATE POLICY "commerce digital files update" ON public.commerce_digital_files FOR UPDATE TO authenticated USING (commerce_has_permission('catalog.write')) WITH CHECK (commerce_has_permission('catalog.write'));
CREATE POLICY "commerce digital files delete" ON public.commerce_digital_files FOR DELETE TO authenticated USING (commerce_has_permission('catalog.write'));

DROP POLICY IF EXISTS "commerce admin payments" ON public.commerce_payments;
DROP POLICY IF EXISTS "commerce staff finance payments" ON public.commerce_payments;
CREATE POLICY "commerce payments read" ON public.commerce_payments FOR SELECT TO authenticated USING (commerce_has_permission('finance.write') OR commerce_has_permission('orders.write'));
CREATE POLICY "commerce payments write" ON public.commerce_payments FOR ALL TO authenticated USING (commerce_has_permission('finance.write')) WITH CHECK (commerce_has_permission('finance.write'));

DROP POLICY IF EXISTS "commerce admin refunds" ON public.commerce_refunds;
DROP POLICY IF EXISTS "commerce staff finance refunds" ON public.commerce_refunds;
CREATE POLICY "commerce refunds read" ON public.commerce_refunds FOR SELECT TO authenticated USING (commerce_has_permission('finance.write') OR commerce_has_permission('orders.write'));
CREATE POLICY "commerce refunds write" ON public.commerce_refunds FOR ALL TO authenticated USING (commerce_has_permission('finance.write')) WITH CHECK (commerce_has_permission('finance.write'));

DROP POLICY IF EXISTS "commerce admin shipments" ON public.commerce_shipments;
DROP POLICY IF EXISTS "commerce staff shipments" ON public.commerce_shipments;
CREATE POLICY "commerce shipments staff" ON public.commerce_shipments FOR ALL TO authenticated USING (commerce_has_permission('orders.write')) WITH CHECK (commerce_has_permission('orders.write'));

DROP POLICY IF EXISTS "commerce staff roles admin" ON public.commerce_staff_roles;
DROP POLICY IF EXISTS "commerce staff roles read" ON public.commerce_staff_roles;
CREATE POLICY "commerce staff roles read" ON public.commerce_staff_roles FOR SELECT TO authenticated USING (commerce_is_admin() OR user_id=(select auth.uid()));
CREATE POLICY "commerce staff roles insert" ON public.commerce_staff_roles FOR INSERT TO authenticated WITH CHECK (commerce_is_admin());
CREATE POLICY "commerce staff roles update" ON public.commerce_staff_roles FOR UPDATE TO authenticated USING (commerce_is_admin()) WITH CHECK (commerce_is_admin());
CREATE POLICY "commerce staff roles delete" ON public.commerce_staff_roles FOR DELETE TO authenticated USING (commerce_is_admin());

ALTER POLICY "commerce addresses self" ON public.commerce_addresses USING (commerce_is_admin() OR customer_id IN (SELECT id FROM public.commerce_customers WHERE auth_user_id=(select auth.uid()))) WITH CHECK (commerce_is_admin() OR customer_id IN (SELECT id FROM public.commerce_customers WHERE auth_user_id=(select auth.uid())));
ALTER POLICY "commerce entitlement self" ON public.commerce_digital_entitlements USING (commerce_is_admin() OR customer_id IN (SELECT id FROM public.commerce_customers WHERE auth_user_id=(select auth.uid())));
ALTER POLICY "commerce wishlist self" ON public.commerce_wishlists USING (commerce_is_admin() OR customer_id IN (SELECT id FROM public.commerce_customers WHERE auth_user_id=(select auth.uid()))) WITH CHECK (commerce_is_admin() OR customer_id IN (SELECT id FROM public.commerce_customers WHERE auth_user_id=(select auth.uid())));
ALTER POLICY "commerce return customer insert" ON public.commerce_returns WITH CHECK (customer_id IN (SELECT id FROM public.commerce_customers WHERE auth_user_id=(select auth.uid())) AND order_id IN (SELECT o.id FROM public.commerce_orders o JOIN public.commerce_customers c ON c.id=o.customer_id WHERE c.auth_user_id=(select auth.uid())));
ALTER POLICY "commerce return customer read" ON public.commerce_returns USING (customer_id IN (SELECT id FROM public.commerce_customers WHERE auth_user_id=(select auth.uid())));
ALTER POLICY "commerce returns items customer insert" ON public.commerce_returns_items WITH CHECK (return_id IN (SELECT r.id FROM public.commerce_returns r JOIN public.commerce_customers c ON c.id=r.customer_id WHERE c.auth_user_id=(select auth.uid())));
ALTER POLICY "commerce returns items self" ON public.commerce_returns_items USING (commerce_has_permission('orders.write') OR return_id IN (SELECT r.id FROM public.commerce_returns r JOIN public.commerce_customers c ON c.id=r.customer_id WHERE c.auth_user_id=(select auth.uid())));
ALTER POLICY "commerce customers read" ON public.commerce_customers USING ((select auth.uid())=auth_user_id OR commerce_has_permission('customers.write'));
ALTER POLICY "commerce customers insert" ON public.commerce_customers WITH CHECK ((select auth.uid())=auth_user_id OR commerce_has_permission('customers.write'));
ALTER POLICY "commerce customers update" ON public.commerce_customers USING ((select auth.uid())=auth_user_id OR commerce_has_permission('customers.write')) WITH CHECK ((select auth.uid())=auth_user_id OR commerce_has_permission('customers.write'));
ALTER POLICY "commerce orders read" ON public.commerce_orders USING (commerce_has_permission('orders.write') OR customer_id IN (SELECT id FROM public.commerce_customers WHERE auth_user_id=(select auth.uid())));
ALTER POLICY "commerce order items read" ON public.commerce_order_items USING (commerce_has_permission('orders.write') OR order_id IN (SELECT o.id FROM public.commerce_orders o JOIN public.commerce_customers c ON c.id=o.customer_id WHERE c.auth_user_id=(select auth.uid())));
ALTER POLICY "commerce service jobs read" ON public.commerce_service_jobs USING (commerce_has_permission('orders.write') OR customer_id IN (SELECT id FROM public.commerce_customers WHERE auth_user_id=(select auth.uid())));
ALTER POLICY "commerce service files read" ON public.commerce_service_files USING (commerce_has_permission('orders.write') OR (visibility='customer' AND service_job_id IN (SELECT j.id FROM public.commerce_service_jobs j JOIN public.commerce_customers c ON c.id=j.customer_id WHERE c.auth_user_id=(select auth.uid()))));
ALTER POLICY "commerce reviews read" ON public.commerce_reviews USING (status='approved' OR ((select auth.uid()) IS NOT NULL AND customer_id IN (SELECT id FROM public.commerce_customers WHERE auth_user_id=(select auth.uid()))) OR commerce_has_permission('catalog.write'));
ALTER POLICY "commerce reviews insert self" ON public.commerce_reviews WITH CHECK (customer_id IN (SELECT id FROM public.commerce_customers WHERE auth_user_id=(select auth.uid())));
