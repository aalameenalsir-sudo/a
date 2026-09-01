-- Atomic order commit: order, lines, inventory, fulfillment records, LTV and coupon usage
-- succeed or roll back together.
create or replace function public.commerce_commit_order(
 p_customer_id uuid,
 p_order jsonb,
 p_items jsonb,
 p_coupon_code text default null
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare
 o public.commerce_orders%rowtype;
 line jsonb;
 line_id uuid;
 q int;
 p public.commerce_products%rowtype;
 v public.commerce_product_variants%rowtype;
 remaining int;
 expiry timestamptz;
begin
 insert into public.commerce_orders(
  order_number,customer_id,email,phone,name,company,city,address_line,currency,
  subtotal,discount,vat,shipping,total,coupon_code,payment_method,payment_status,
  shipping_method,idempotency_key,source,medium,campaign,notes
 ) values(
  p_order->>'order_number',p_customer_id,p_order->>'email',nullif(p_order->>'phone',''),p_order->>'name',nullif(p_order->>'company',''),
  nullif(p_order->>'city',''),nullif(p_order->>'address_line',''),coalesce(nullif(p_order->>'currency',''),'SAR'),
  (p_order->>'subtotal')::numeric,(p_order->>'discount')::numeric,(p_order->>'vat')::numeric,(p_order->>'shipping')::numeric,(p_order->>'total')::numeric,
  nullif(p_coupon_code,''),p_order->>'payment_method',p_order->>'payment_status',nullif(p_order->>'shipping_method',''),
  nullif(p_order->>'idempotency_key',''),nullif(p_order->>'source',''),nullif(p_order->>'medium',''),nullif(p_order->>'campaign',''),nullif(p_order->>'notes','')
 ) returning * into o;

 for line in select value from jsonb_array_elements(p_items)
 loop
  q:=greatest(1,least(99,(line->>'quantity')::int));
  select * into p from public.commerce_products where id=(line->>'product_id')::uuid and active=true and status='active' for update;
  if not found then raise exception 'Invalid product'; end if;
  if nullif(line->>'variant_id','') is not null then
   select * into v from public.commerce_product_variants where id=(line->>'variant_id')::uuid and product_id=p.id and active=true for update;
   if not found then raise exception 'Invalid variant'; end if;
   if p.track_inventory then
    if v.inventory_qty is null or v.inventory_qty<q then raise exception 'Insufficient inventory'; end if;
    remaining:=v.inventory_qty-q;
    update public.commerce_product_variants set inventory_qty=remaining where id=v.id;
    if remaining<=p.low_stock_threshold then
     insert into public.commerce_automation_events(event_type,entity_type,entity_id,payload)
     values('inventory.low','variant',v.id::text,jsonb_build_object('product',p.name_en,'sku',v.sku,'remaining',remaining));
    end if;
   end if;
  elsif p.track_inventory then
   if p.inventory_qty is null or p.inventory_qty<q then raise exception 'Insufficient inventory'; end if;
   remaining:=p.inventory_qty-q;
   update public.commerce_products set inventory_qty=remaining,updated_at=now() where id=p.id;
   if remaining<=p.low_stock_threshold then
    insert into public.commerce_automation_events(event_type,entity_type,entity_id,payload)
    values('inventory.low','product',p.id::text,jsonb_build_object('product',p.name_en,'sku',p.sku,'remaining',remaining));
   end if;
  end if;

  insert into public.commerce_order_items(order_id,product_id,variant_id,product_type,name,sku,unit_price,quantity,line_total,metadata)
  values(o.id,p.id,nullif(line->>'variant_id','')::uuid,p.type,line->>'name',nullif(line->>'sku',''),(line->>'unit_price')::numeric,q,(line->>'line_total')::numeric,coalesce(line->'metadata','{}'::jsonb))
  returning id into line_id;

  if p.type='digital' then
   expiry:=case when coalesce((line->'metadata'->>'download_expiry_hours')::int,0)>0 then now()+make_interval(hours=>(line->'metadata'->>'download_expiry_hours')::int) else null end;
   insert into public.commerce_digital_entitlements(order_item_id,customer_id,product_id,expires_at,max_downloads)
   values(line_id,p_customer_id,p.id,expiry,nullif(line->'metadata'->>'download_limit','')::int);
  elsif p.type='service' then
   insert into public.commerce_service_jobs(order_item_id,customer_id,product_id,requirements)
   values(line_id,p_customer_id,p.id,jsonb_build_object('requested',coalesce(line->'metadata'->'service_requirements','[]'::jsonb)));
  end if;
 end loop;

 update public.commerce_customers set lifetime_value=lifetime_value+o.total,updated_at=now() where id=p_customer_id;
 if nullif(p_coupon_code,'') is not null then update public.commerce_coupons set uses=uses+1 where code=upper(p_coupon_code) and active=true; end if;
 insert into public.commerce_customer_activities(customer_id,activity_type,note,metadata)
 values(p_customer_id,'order_created','Order '||o.order_number,jsonb_build_object('total',o.total,'payment_method',o.payment_method));
 insert into public.commerce_automation_events(event_type,entity_type,entity_id,payload)
 values('order.created','order',o.id::text,jsonb_build_object('order_number',o.order_number,'total',o.total,'email',o.email,'phone',o.phone,'locale',coalesce(p_order->>'locale','en')));
 return to_jsonb(o);
end $$;
revoke all on function public.commerce_commit_order(uuid,jsonb,jsonb,text) from public,anon,authenticated;
