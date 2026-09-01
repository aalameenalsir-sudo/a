create or replace function public.analytics_track_visit(p_visitor_id uuid, p_scope text, p_path text default null, p_product_key text default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_visitor_id is null or p_scope not in ('website','store') then return; end if;
  insert into public.analytics_visitors(visitor_id,scope,last_path)
  values(p_visitor_id,p_scope,left(coalesce(p_path,''),500))
  on conflict(visitor_id,scope) do update set
    last_seen=now(), page_views=public.analytics_visitors.page_views+1, last_path=excluded.last_path;
  if p_scope='store' and nullif(trim(coalesce(p_product_key,'')),'') is not null then
    insert into public.analytics_product_views(visitor_id,product_key)
    values(p_visitor_id,left(trim(p_product_key),200))
    on conflict(visitor_id,product_key) do update set last_seen=now(), view_count=public.analytics_product_views.view_count+1;
  end if;
end $$;

create or replace function public.analytics_heartbeat(p_visitor_id uuid, p_scope text, p_path text default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_visitor_id is null or p_scope not in ('website','store') then return; end if;
  update public.analytics_visitors set last_seen=now(), last_path=left(coalesce(p_path,last_path),500)
  where visitor_id=p_visitor_id and scope=p_scope;
end $$;

create or replace function public.analytics_summary(p_scope text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
  if p_scope not in ('website','store') then raise exception 'invalid analytics scope'; end if;
  if not (public.commerce_is_admin() or public.commerce_has_permission('reports.read')) then raise exception 'insufficient privileges'; end if;
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
revoke all on public.analytics_visitors, public.analytics_product_views from anon, authenticated;
