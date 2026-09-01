DROP POLICY IF EXISTS "commerce payments write" ON public.commerce_payments;
CREATE POLICY "commerce payments insert" ON public.commerce_payments FOR INSERT TO authenticated WITH CHECK (commerce_has_permission('finance.write'));
CREATE POLICY "commerce payments update" ON public.commerce_payments FOR UPDATE TO authenticated USING (commerce_has_permission('finance.write')) WITH CHECK (commerce_has_permission('finance.write'));
CREATE POLICY "commerce payments delete" ON public.commerce_payments FOR DELETE TO authenticated USING (commerce_has_permission('finance.write'));
DROP POLICY IF EXISTS "commerce refunds write" ON public.commerce_refunds;
CREATE POLICY "commerce refunds insert" ON public.commerce_refunds FOR INSERT TO authenticated WITH CHECK (commerce_has_permission('finance.write'));
CREATE POLICY "commerce refunds update" ON public.commerce_refunds FOR UPDATE TO authenticated USING (commerce_has_permission('finance.write')) WITH CHECK (commerce_has_permission('finance.write'));
CREATE POLICY "commerce refunds delete" ON public.commerce_refunds FOR DELETE TO authenticated USING (commerce_has_permission('finance.write'));
