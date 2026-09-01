(async()=>{
const A=ASolutionAdmin,esc=A.escapeHTML,id=new URLSearchParams(location.search).get('id'),status=document.querySelector('#detail-status');let role=null,order=null,items=[];
try{role=await A.guard()}catch(e){A.showError(status,e);return}
if(!id){A.showError(status,'Missing order ID');return}
const money=v=>`${order.currency} ${Number(v||0).toLocaleString()}`;
async function load(){
 const [orders,itemRows,payments,shipments]=await Promise.all([
  A.req('commerce_orders',`?id=eq.${encodeURIComponent(id)}&select=*`),
  A.req('commerce_order_items',`?order_id=eq.${encodeURIComponent(id)}&select=*`),
  A.req('commerce_payments',`?order_id=eq.${encodeURIComponent(id)}&select=*&order=created_at.desc`),
  A.req('commerce_shipments',`?order_id=eq.${encodeURIComponent(id)}&select=*&order=shipped_at.desc.nullslast`)
 ]);
 order=orders?.[0];items=itemRows||[];if(!order)throw new Error('Order not found');
 const itemIds=items.map(x=>x.id);let serviceJobs=[],digitalEntitlements=[];
 if(itemIds.length){const ids=itemIds.map(encodeURIComponent).join(',');
  [serviceJobs,digitalEntitlements]=await Promise.all([
   A.req('commerce_service_jobs',`?order_item_id=in.(${ids})&select=*`),
   A.req('commerce_digital_entitlements',`?order_item_id=in.(${ids})&select=*`)
  ]);
 }
 document.querySelector('#order-title').textContent=order.order_number;
 document.querySelector('#order-items').innerHTML=items.map(x=>`<div class="line"><span>${esc(x.name)} × ${x.quantity}<br><small>${esc(x.product_type||'')}</small></span><b>${money(x.line_total)}</b></div>`).join('');
 document.querySelector('#customer').innerHTML=`<p><b>${esc(order.name)}</b><br>${esc(order.email)}<br>${esc(order.phone||'')}</p><p>${esc(order.address_line||'')}<br>${esc(order.city||'')}</p><p>${esc(order.notes||'')}</p>`;
 document.querySelector('#totals').innerHTML=[['Subtotal',order.subtotal],['Discount',-Number(order.discount||0)],['Shipping',order.shipping],['VAT',order.vat],['Total',order.total]].map(([n,v])=>`<div class="line"><span>${n}</span><b>${money(v)}</b></div>`).join('');
 const hasPhysical=items.some(x=>x.product_type==='physical'),hasService=items.some(x=>x.product_type==='service'),hasDigital=items.some(x=>x.product_type==='digital');
 document.querySelector('#shipment-card').hidden=!hasPhysical;
 document.querySelector('#service-card').hidden=!hasService;
 document.querySelector('#digital-card').hidden=!hasDigital;
 document.querySelector('#service-jobs').innerHTML=serviceJobs.map(j=>`<div class="line"><span>Status<br><small>${esc(j.appointment_at||'No appointment')}</small></span><b>${esc(j.status||'pending')}</b></div>${j.customer_notes?`<p>${esc(j.customer_notes)}</p>`:''}`).join('')||'<p>No service job found.</p>';
 document.querySelector('#digital-entitlements').innerHTML=digitalEntitlements.map(d=>`<div class="line"><span>Downloads</span><b>${Number(d.download_count||0)} / ${Number(d.max_downloads||0)}</b></div><div class="line"><span>Expires</span><b>${esc(d.expires_at||'No expiry')}</b></div>`).join('')||'<p>No digital entitlement yet.</p>';
 document.querySelector('#status-form').order_status.value=order.order_status||'open';document.querySelector('#status-form').fulfillment_status.value=order.fulfillment_status;
 document.querySelector('#payment-info').innerHTML=`<p>Method: <b>${esc(order.payment_method)}</b><br>Status: <b>${esc(order.payment_status)}</b></p>`+payments.map(p=>`<small>${esc(p.provider)} · ${esc(p.status)} · ${money(p.amount)}</small><br>`).join('');
 const s=shipments?.[0];if(s&&hasPhysical){const f=document.querySelector('#shipment-form');f.provider.value=s.provider||'';f.tracking_number.value=s.tracking_number||'';f.tracking_url.value=s.tracking_url||'';f.status.value=s.status||'pending'}
 document.querySelector('#finance-card').hidden=!(A.can('finance.write',role)||['owner','admin'].includes(role));
}
document.querySelector('#status-form').addEventListener('submit',async e=>{e.preventDefault();if(!(A.can('orders.write',role)||['owner','admin'].includes(role)))return alert('No permission');const form=e.currentTarget,d=Object.fromEntries(new FormData(form));await A.req('commerce_orders',`?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({...d,updated_at:new Date().toISOString()})});status.textContent='Status saved.';await load()});
document.querySelector('#shipment-form').addEventListener('submit',async e=>{e.preventDefault();if(!items.some(x=>x.product_type==='physical'))return; if(!(A.can('orders.write',role)||['owner','admin'].includes(role)))return alert('No permission');const form=e.currentTarget,d=Object.fromEntries(new FormData(form)),existing=(await A.req('commerce_shipments',`?order_id=eq.${encodeURIComponent(id)}&select=id&limit=1`))?.[0],payload={order_id:id,provider:d.provider||null,tracking_number:d.tracking_number||null,tracking_url:d.tracking_url||null,status:d.status,shipped_at:d.status==='shipped'?new Date().toISOString():null,delivered_at:d.status==='delivered'?new Date().toISOString():null};if(existing)await A.req('commerce_shipments',`?id=eq.${existing.id}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify(payload)});else await A.req('commerce_shipments','',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(payload)});status.textContent='Shipment saved.';await load()});
document.querySelector('#refund-form').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget,d=Object.fromEntries(new FormData(form)),amount=Number(d.amount);if(!amount||amount<=0)return alert('Enter a refund amount');if(!confirm(`Refund ${order.currency} ${amount}?`))return;const r=await A.request('/functions/v1/commerce-refund',{method:'POST',body:JSON.stringify({order_id:id,amount,reason:d.reason||''})});status.textContent=`Refund created: ${r.refund?.status||'ok'}`;form.reset();await load()});
load().catch(e=>A.showError(status,e));
})();