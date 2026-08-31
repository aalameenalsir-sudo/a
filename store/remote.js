(function(){
const cfg=window.ASOLUTION_STORE_CONFIG||{}, sb=cfg.supabase||{};
const base=(sb.url||'').replace(/\/$/,''); const key=sb.publishableKey||''; const SESSION='asolution_supabase_session';
function session(){try{return JSON.parse(localStorage.getItem(SESSION)||'null')}catch{return null}}
function headers(auth=true){const s=session();const h={'Content-Type':'application/json','apikey':key};if(auth&&s?.access_token)h.Authorization='Bearer '+s.access_token;else if(key)h.Authorization='Bearer '+key;return h}
async function request(url,opts={}){const r=await fetch(url,{...opts,headers:{...headers(opts.auth!==false),...(opts.headers||{})}});let data=null;try{data=await r.json()}catch{}if(!r.ok)throw new Error(data?.msg||data?.message||data?.error_description||data?.error||('HTTP '+r.status));return data}
async function listProducts(){return request(base+'/rest/v1/commerce_products?active=eq.true&select=*,commerce_categories(slug,name_en,name_ar)&order=featured.desc,created_at.asc',{auth:false})}
async function listReviews(productId){return request(base+'/rest/v1/commerce_reviews?status=eq.approved&product_id=eq.'+encodeURIComponent(productId)+'&select=rating,title,body,created_at&order=created_at.desc',{auth:false})}
async function signup(email,password,meta={}){const data=await request(base+'/auth/v1/signup',{method:'POST',body:JSON.stringify({email,password,data:meta}),auth:false});if(data?.access_token)localStorage.setItem(SESSION,JSON.stringify(data));return data}
async function login(email,password){const data=await request(base+'/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password}),auth:false});localStorage.setItem(SESSION,JSON.stringify(data));return data}
async function logout(){try{await request(base+'/auth/v1/logout',{method:'POST'})}finally{localStorage.removeItem(SESSION)}}
async function me(){if(!session()?.access_token)return null;return request(base+'/auth/v1/user')}
async function myCustomer(){const u=await me();if(!u)return null;let rows=await request(base+'/rest/v1/commerce_customers?auth_user_id=eq.'+u.id+'&select=*');if(rows?.[0])return rows[0];const created=await request(base+'/rest/v1/commerce_customers',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({auth_user_id:u.id,email:u.email,name:u.user_metadata?.name||u.email,locale:document.documentElement.lang==='ar'?'ar':'en',source:'account'})});return created?.[0]||null}
async function myOrders(){const c=await myCustomer();if(!c)return[];return request(base+'/rest/v1/commerce_orders?customer_id=eq.'+c.id+'&select=*&order=created_at.desc')}
async function myWishlist(){const c=await myCustomer();if(!c)return[];return request(base+'/rest/v1/commerce_wishlists?customer_id=eq.'+c.id+'&select=product_id,commerce_products(*)')}
async function addWishlist(productId){const c=await myCustomer();if(!c)throw new Error('LOGIN_REQUIRED');return request(base+'/rest/v1/commerce_wishlists',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify({customer_id:c.id,product_id:productId})})}
async function removeWishlist(productId){const c=await myCustomer();if(!c)throw new Error('LOGIN_REQUIRED');return request(base+'/rest/v1/commerce_wishlists?customer_id=eq.'+c.id+'&product_id=eq.'+productId,{method:'DELETE'})}
async function submitReview(productId,rating,title,body){const c=await myCustomer();if(!c)throw new Error('LOGIN_REQUIRED');return request(base+'/rest/v1/commerce_reviews',{method:'POST',body:JSON.stringify({product_id:productId,customer_id:c.id,rating:Number(rating),title,body})})}
async function createOrder(payload){return request(base+'/functions/v1/commerce-create-order',{method:'POST',body:JSON.stringify(payload)})}
async function trackOrder(orderNumber,email){return request(base+'/functions/v1/commerce-track-order',{method:'POST',body:JSON.stringify({order_number:orderNumber,email}),auth:false})}
async function adminList(table,select='*',suffix=''){return request(base+'/rest/v1/'+table+'?select='+encodeURIComponent(select)+suffix)}
async function adminPatch(table,id,patch){return request(base+'/rest/v1/'+table+'?id=eq.'+id,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify(patch)})}
async function adminInsert(table,row){return request(base+'/rest/v1/'+table,{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(row)})}
window.ASolutionRemote={session,signup,login,logout,me,listProducts,listReviews,myCustomer,myOrders,myWishlist,addWishlist,removeWishlist,submitReview,createOrder,trackOrder,adminList,adminPatch,adminInsert};
})();