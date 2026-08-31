(async()=>{try{
await ASolutionAdmin.guard();
const esc=ASolutionAdmin.escapeHTML;
const [orders,products,customers]=await Promise.all([
  ASolutionAdmin.req('commerce_orders','?select=id,order_number,name,total,payment_status,fulfillment_status,created_at&order=created_at.desc'),
  ASolutionAdmin.req('commerce_products','?select=id,name_en,inventory_qty,track_inventory,active'),
  ASolutionAdmin.req('commerce_customers','?select=id,lifetime_value')
]);
const revenue=orders.filter(o=>o.payment_status==='paid').reduce((s,o)=>s+Number(o.total||0),0);
const open=orders.filter(o=>!['fulfilled','cancelled','returned'].includes(o.fulfillment_status)).length;
const ltv=customers.reduce((s,c)=>s+Number(c.lifetime_value||0),0);
document.querySelector('#admin-kpis').innerHTML=`<div class="kpi"><small>PAID REVENUE</small><b>SAR ${revenue.toLocaleString()}</b></div><div class="kpi"><small>ORDERS</small><b>${orders.length}</b></div><div class="kpi"><small>OPEN</small><b>${open}</b></div><div class="kpi"><small>CUSTOMER LTV</small><b>SAR ${ltv.toLocaleString()}</b></div>`;
document.querySelector('#recent-orders').innerHTML=orders.slice(0,8).map(o=>`<div class="list-row"><b>${esc(o.order_number)}</b><span>${esc(o.name)}</span><span>SAR ${Number(o.total||0).toLocaleString()}</span><span>${esc(o.fulfillment_status)}</span></div>`).join('')||'<p>No orders yet.</p>';
const low=products.filter(p=>p.active&&p.track_inventory&&Number(p.inventory_qty)<=5);
document.querySelector('#attention').innerHTML=low.length?low.map(p=>`<div class="list-row"><b>${esc(p.name_en)}</b><span>Low stock: ${Number(p.inventory_qty||0)}</span></div>`).join(''):'<p>No inventory alerts.</p>';
}catch(e){ASolutionAdmin.showError('#admin-kpis',e)}})();
