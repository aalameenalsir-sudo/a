import { createClient } from 'npm:@supabase/supabase-js@2';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'};
const json=(b:unknown,s=200)=>new Response(JSON.stringify(b),{status:s,headers:{...cors,'Content-Type':'application/json'}});
Deno.serve(async(req:Request)=>{if(req.method==='OPTIONS')return new Response('ok',{headers:cors});if(req.method!=='POST')return json({error:'Method not allowed'},405);try{
 const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
 const token=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,''),{data:auth}=await db.auth.getUser(token);if(!auth.user)return json({error:'Unauthorized'},401);
 let role:string|null=null;const {data:staff}=await db.from('commerce_staff_roles').select('role,active').eq('user_id',auth.user.id).maybeSingle();if(staff?.active)role=staff.role;if(!role){const {data:profile}=await db.from('profiles').select('role').eq('id',auth.user.id).maybeSingle();if(profile?.role==='admin')role='admin';}if(!['owner','admin','finance'].includes(role||''))return json({error:'Forbidden'},403);
 const body=await req.json(),orderId=String(body.order_id||''),amount=Math.round(Number(body.amount||0)*100)/100,reason=String(body.reason||'').slice(0,1000);if(!orderId||amount<=0)return json({error:'Invalid refund'},400);
 const {data:order}=await db.from('commerce_orders').select('id,total,payment_status').eq('id',orderId).single();if(!order||!['paid','partially_refunded'].includes(order.payment_status))return json({error:'Order is not refundable'},409);
 const {data:payment}=await db.from('commerce_payments').select('*').eq('order_id',orderId).eq('status','paid').order('created_at',{ascending:false}).limit(1).maybeSingle();
 let endpoint:string|null=null,secret:string|null=null;if(payment&&payment.provider!=='manual'){endpoint=Deno.env.get('PAYMENT_REFUND_ENDPOINT')||null;secret=Deno.env.get('PAYMENT_SECRET_KEY')||null;if(!endpoint||!secret)return json({error:'Online refund provider is not configured'},503);}
 const {data:reservation,error:reserveError}=await db.rpc('commerce_reserve_refund',{p_order_id:orderId,p_amount:amount,p_reason:reason,p_payment_id:payment?.id||null,p_actor_id:auth.user.id});if(reserveError){if(String(reserveError.message||'').includes('exceeds'))return json({error:'Refund exceeds paid total'},409);throw reserveError;}
 const refund=reservation.refund;let providerReference=null;
 if(payment&&payment.provider!=='manual'){
  const r=await fetch(endpoint!,{method:'POST',headers:{Authorization:`Bearer ${secret}`,'Content-Type':'application/json','Idempotency-Key':`refund:${refund.id}`},body:JSON.stringify({payment_reference:payment.provider_reference,amount,reference:refund.id})});const data=await r.json().catch(()=>({}));
  if(!r.ok){await db.from('commerce_refunds').update({status:'failed'}).eq('id',refund.id);await db.from('commerce_audit_logs').insert({actor_id:auth.user.id,action:'refund.failed',entity_type:'order',entity_id:orderId,after_data:{refund_id:refund.id,amount}});return json({error:'Payment provider rejected refund'},502);}
  providerReference=data.id||data.reference||null;
 }
 await db.from('commerce_refunds').update({status:'succeeded'}).eq('id',refund.id);
 const {data:succeeded}=await db.from('commerce_refunds').select('amount').eq('order_id',orderId).eq('status','succeeded');const refunded=(succeeded||[]).reduce((s:any,x:any)=>s+Number(x.amount||0),0),nextStatus=refunded>=Number(order.total)?'refunded':'partially_refunded';
 await db.from('commerce_orders').update({payment_status:nextStatus,updated_at:new Date().toISOString()}).eq('id',orderId);
 await db.from('commerce_audit_logs').insert({actor_id:auth.user.id,action:'refund.succeeded',entity_type:'order',entity_id:orderId,after_data:{refund_id:refund.id,amount,status:'succeeded',provider_reference:providerReference}});
 return json({ok:true,refund:{...refund,status:'succeeded',provider_reference:providerReference},payment_status:nextStatus});
}catch(e){console.error(e);return json({error:'Unable to refund'},500);}});
