-- Financial hardening: reserve refund capacity atomically so concurrent requests cannot over-refund.
create or replace function public.commerce_reserve_refund(
 p_order_id uuid,
 p_amount numeric,
 p_reason text,
 p_payment_id uuid,
 p_actor_id uuid
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare
 o public.commerce_orders%rowtype;
 already numeric(12,2);
 r public.commerce_refunds%rowtype;
begin
 if p_amount is null or p_amount<=0 then raise exception 'Invalid refund amount'; end if;
 select * into o from public.commerce_orders where id=p_order_id for update;
 if not found or o.payment_status not in ('paid','partially_refunded') then raise exception 'Order is not refundable'; end if;
 select coalesce(sum(amount),0) into already from public.commerce_refunds where order_id=p_order_id and status in ('pending','succeeded');
 if already+p_amount>o.total then raise exception 'Refund exceeds paid total'; end if;
 insert into public.commerce_refunds(order_id,payment_id,amount,reason,status)
 values(p_order_id,p_payment_id,p_amount,nullif(p_reason,''),'pending') returning * into r;
 insert into public.commerce_audit_logs(actor_id,action,entity_type,entity_id,after_data)
 values(p_actor_id,'refund.reserve','order',p_order_id::text,jsonb_build_object('refund_id',r.id,'amount',p_amount,'reserved_total',already+p_amount));
 return jsonb_build_object('refund',to_jsonb(r),'reserved_total',already+p_amount,'order_total',o.total);
end $$;
revoke all on function public.commerce_reserve_refund(uuid,numeric,text,uuid,uuid) from public,anon,authenticated;
