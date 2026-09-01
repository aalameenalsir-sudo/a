create table if not exists public.analytics_visitors (
  id bigint generated always as identity primary key,
  visitor_id uuid not null,
  scope text not null check (scope in ('website','store')),
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  page_views bigint not null default 1 check (page_views >= 1),
  last_path text,
  unique(visitor_id, scope)
);
create index if not exists analytics_visitors_scope_last_seen_idx on public.analytics_visitors(scope,last_seen desc);

create table if not exists public.analytics_product_views (
  id bigint generated always as identity primary key,
  visitor_id uuid not null,
  product_key text not null,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  view_count bigint not null default 1 check (view_count >= 1),
  unique(visitor_id, product_key)
);
create index if not exists analytics_product_views_last_seen_idx on public.analytics_product_views(last_seen desc);

alter table public.analytics_visitors enable row level security;
alter table public.analytics_product_views enable row level security;
revoke all on public.analytics_visitors from anon, authenticated;
revoke all on public.analytics_product_views from anon, authenticated;

create or replace function public.analytics_track_visit(p_visitor_id uuid, p_scope text, p_path text default null, p_product_key text default null)
returns void language plpgsql security definer set search_path=public as $$
begin
  if p_visitor_id is null or p_scope not in ('website','store') then return; end if;
  insert into analytics_visitors(visitor_id,scope,last_path)
  values(p_visitor_id,p_scope,left(coalesce(p_path,''),500))
  on conflict(visitor_id,scope) do update set
    last_seen=now(), page_views=analytics_visitors.page_views+1, last_path=excluded.last_path;
  if p_scope='store' and nullif(trim(coalesce(p_product_key,'')),'') is not null then
    insert into analytics_product_views(visitor_id,product_key)
    values(p_visitor_id,left(trim(p_product_key),200))
    on conflict(visitor_id,product_key) do update set last_seen=now(), view_count=analytics_product_views.view_count+1;
  end if;
end $$;

create or replace function public.analytics_heartbeat(p_visitor_id uuid, p_scope text, p_path text default null)
returns void language plpgsql security definer set search_path=public as $$
begin
  if p_visitor_id is null or p_scope not in ('website','store') then return; end if;
  update analytics_visitors set last_seen=now(), last_path=left(coalesce(p_path,last_path),500)
  where visitor_id=p_visitor_id and scope=p_scope;
end $$;

create or replace function public.analytics_summary(p_scope text)
returns jsonb language sql security definer stable set search_path=public as $$
select jsonb_build_object(
 'scope',p_scope,
 'total_visitors',count(*),
 'today_visitors',count(*) filter(where last_seen >= date_trunc('day',now())),
 'seven_day_visitors',count(*) filter(where last_seen >= now()-interval '7 days'),
 'thirty_day_visitors',count(*) filter(where last_seen >= now()-interval '30 days'),
 'online_now',count(*) filter(where last_seen >= now()-interval '5 minutes'),
 'page_views',coalesce(sum(page_views),0),
 'product_views',case when p_scope='store' then (select coalesce(sum(view_count),0) from analytics_product_views) else 0 end
) from analytics_visitors where scope=p_scope;
$$;

revoke all on function public.analytics_track_visit(uuid,text,text,text) from public;
revoke all on function public.analytics_heartbeat(uuid,text,text) from public;
revoke all on function public.analytics_summary(text) from public;
grant execute on function public.analytics_track_visit(uuid,text,text,text) to anon, authenticated;
grant execute on function public.analytics_heartbeat(uuid,text,text) to anon, authenticated;
grant execute on function public.analytics_summary(text) to authenticated;
