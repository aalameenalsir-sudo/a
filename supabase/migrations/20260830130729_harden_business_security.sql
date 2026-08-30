-- Recovered from remote migration history: 20260830130729
create or replace function public.is_admin()
returns boolean language sql stable security invoker set search_path=public
as $$ select exists(select 1 from public.profiles where profiles.id=auth.uid() and profiles.role='admin'); $$;
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path=public as $$ begin new.updated_at=now();return new;end; $$;
revoke execute on function public.recalculate_quotation_totals(bigint) from public,anon,authenticated;
revoke execute on function public.recalculate_invoice_totals(bigint) from public,anon,authenticated;
