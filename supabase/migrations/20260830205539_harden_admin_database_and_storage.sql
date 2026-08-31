-- Harden calculation functions so they execute with the caller's RLS permissions.
alter function public.recalculate_invoice_totals(bigint) security invoker;
alter function public.recalculate_quotation_totals(bigint) security invoker;

-- Keep explicit EXECUTE grants for authenticated admins; RLS now remains enforced.
revoke all on function public.recalculate_invoice_totals(bigint) from public, anon;
revoke all on function public.recalculate_quotation_totals(bigint) from public, anon;
grant execute on function public.recalculate_invoice_totals(bigint) to authenticated, service_role;
grant execute on function public.recalculate_quotation_totals(bigint) to authenticated, service_role;

-- Restrict uploads to normal web image formats and a sane per-file size.
update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg','image/png','image/webp']::text[]
where id = 'project-images';
