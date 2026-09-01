(function(){
'use strict';
function clampQty(value){const n=Math.floor(Number(value)||1);return Math.min(99,Math.max(1,n));}
function normalizeCatalog(rows=[]){return Array.isArray(rows)?rows.filter(p=>p&&p.id&&p.slug).map(p=>({
 id:String(p.slug),remoteId:String(p.id),type:['physical','digital','service'].includes(p.type)?p.type:'service',
 category:p.commerce_categories?.slug||p.category||'uncategorized',price:Number(p.price)||0,compareAtPrice:p.compare_at_price==null?null:Number(p.compare_at_price),
 inventoryQty:p.inventory_qty==null?null:Number(p.inventory_qty),trackInventory:!!p.track_inventory,featured:!!p.featured,active:p.active!==false,
 en:{name:p.name_en||p.slug,eyebrow:p.eyebrow_en||'',desc:p.description_en||'',bullets:Array.isArray(p.features_en)?p.features_en:[]},
 ar:{name:p.name_ar||p.name_en||p.slug,eyebrow:p.eyebrow_ar||p.eyebrow_en||'',desc:p.description_ar||p.description_en||'',bullets:Array.isArray(p.features_ar)?p.features_ar:[]}
})):[];}
function normalizeCart(cart=[],catalog=[]){const ids=new Set(catalog.map(p=>p.id));return Array.isArray(cart)?cart.filter(x=>x&&ids.has(String(x.id))&&Number(x.qty)>0).map(x=>({id:String(x.id),qty:clampQty(x.qty),variantId:x.variantId?String(x.variantId):null})):[];}
function addToCart(cart,productId,qty=1,variantId=null,catalog=[]){const next=normalizeCart(cart,catalog);const id=String(productId);if(!catalog.some(p=>p.id===id))return next;const key=variantId?String(variantId):null;const item=next.find(x=>x.id===id&&x.variantId===key);if(item)item.qty=clampQty(item.qty+clampQty(qty));else next.push({id,qty:clampQty(qty),variantId:key});return next;}
function setCartQty(cart,productId,qty,variantId=null,catalog=[]){if(Number(qty)<=0)return removeFromCart(cart,productId,variantId,catalog);const id=String(productId),key=variantId?String(variantId):null;return normalizeCart(cart,catalog).map(x=>x.id===id&&x.variantId===key?{...x,qty:clampQty(qty)}:x);}
function removeFromCart(cart,productId,variantId=null,catalog=[]){const id=String(productId),key=variantId?String(variantId):null;return normalizeCart(cart,catalog).filter(x=>!(x.id===id&&x.variantId===key));}
function cartSubtotal(cart,catalog=[],variants=[]){const pmap=new Map(catalog.map(p=>[p.id,p]));const vmap=new Map(variants.map(v=>[String(v.id),v]));return normalizeCart(cart,catalog).reduce((sum,x)=>{const p=pmap.get(x.id);const v=x.variantId?vmap.get(x.variantId):null;const price=v?.price!=null?Number(v.price):Number(p?.price||0);return sum+price*x.qty;},0);}
function calculateTotals({subtotal=0,discount=0,shipping=0,vatRate=.15}={}){subtotal=Math.max(0,Number(subtotal)||0);discount=Math.min(subtotal,Math.max(0,Number(discount)||0));shipping=Math.max(0,Number(shipping)||0);vatRate=Math.max(0,Number(vatRate)||0);const taxable=subtotal-discount+shipping;const vat=Math.round(taxable*vatRate*100)/100;return {subtotal,discount,shipping,vat,total:Math.round((taxable+vat)*100)/100};}
function paymentMethodEligible(method,cart,catalog=[]){const types=new Set(normalizeCart(cart,catalog).map(x=>catalog.find(p=>p.id===x.id)?.type));if(method==='cod'&&([...types].some(t=>t==='digital'||t==='service')||!types.has('physical')))return false;return true;}
function validateCheckout(v={}){const errors={};if(!String(v.name||'').trim())errors.name='required';if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v.email||'').trim()))errors.email='invalid';if(!String(v.phone||'').trim())errors.phone='required';if(!String(v.city||'').trim())errors.city='required';return {valid:Object.keys(errors).length===0,errors};}
window.ASolutionCommerceDomain={clampQty,normalizeCatalog,normalizeCart,addToCart,setCartQty,removeFromCart,cartSubtotal,calculateTotals,paymentMethodEligible,validateCheckout};
})();
