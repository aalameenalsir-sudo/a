create or replace function public.analytics_summary(p_scope text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
  if p_scope not in ('website','store') then raise exception 'invalid analytics scope'; end if;
  if not coalesce(public.commerce_is_admin(),false) and not coalesce(public.commerce_has_permission('reports.read'),false) then raise exception 'insufficient privileges'; end if;
  select jsonb_build_object(
   'scope',p_scope,
   'total_visitors',count(*),
   'today_visitors',count(*) filter(where last_seen >= date_trunc('day',now())),
   'seven_day_visitors',count(*) filter(where last_seen >= now()-interval '7 days'),
   'thirty_day_visitors',count(*) filter(where last_seen >= now()-interval '30 days'),
   'online_now',count(*) filter(where last_seen >= now()-interval '5 minutes'),
   'page_views',coalesce(sum(page_views),0),
   'product_views',case when p_scope='store' then (select coalesce(sum(view_count),0) from public.analytics_product_views) else 0 end
  ) into result from public.analytics_visitors where scope=p_scope;
  return result;
end $$;
revoke execute on function public.analytics_summary(text) from public, anon;
grant execute on function public.analytics_summary(text) to authenticated;
