(function(){
const PRODUCTS=[
{id:"web-launch",type:"service",category:"digital",price:8900,featured:true,en:{name:"Website Launch System"},ar:{name:"نظام إطلاق موقع احترافي"}},
{id:"commerce",type:"service",category:"digital",price:12500,featured:true,en:{name:"Commerce Experience"},ar:{name:"تجربة متجر إلكتروني"}},
{id:"brand-system",type:"service",category:"creative",price:6000,featured:true,en:{name:"Brand Identity System"},ar:{name:"نظام هوية بصرية"}},
{id:"growth",type:"service",category:"marketing",price:8500,featured:true,en:{name:"Growth Campaign"},ar:{name:"حملة نمو وتسويق"}},
{id:"crm",type:"service",category:"technology",price:15000,featured:false,en:{name:"CRM & Operations System"},ar:{name:"نظام CRM وتشغيل"}},
{id:"social",type:"service",category:"marketing",price:4500,featured:false,en:{name:"Social Content System"},ar:{name:"نظام محتوى سوشيال"}}];
const CATEGORIES={en:[["all","All Solutions"],["digital","Digital"],["creative","Creative"],["marketing","Marketing"],["technology","Technology"]],ar:[["all","كل الحلول"],["digital","رقمي"],["creative","إبداع"],["marketing","تسويق"],["technology","تقنية"]]};
function getProduct(id){return PRODUCTS.find(p=>p.id===id)||null}
function formatMoney(amount,locale="en"){return new Intl.NumberFormat(locale==="ar"?"ar-SA":"en-SA",{style:"currency",currency:"SAR",maximumFractionDigits:0}).format(Number(amount)||0)}
function normalizeCart(cart=[]){return Array.isArray(cart)?cart.filter(x=>getProduct(x.id)&&Number(x.qty)>0).map(x=>({id:x.id,qty:Math.min(99,Math.max(1,Math.floor(Number(x.qty)))),variantId:x.variantId?String(x.variantId):null})):[]}
function addToCart(cart,id,qty=1){const next=normalizeCart(cart),input=typeof id==="object"?id:{id},raw=input.id,canonical=raw==="web"?"web-launch":raw,variantId=input.variantId?String(input.variantId):null,item=next.find(x=>x.id===canonical&&x.variantId===variantId);if(!getProduct(canonical))return next;if(item)item.qty=Math.min(99,item.qty+Math.max(1,Math.floor(qty)));else next.push({id:canonical,qty:Math.max(1,Math.floor(qty)),variantId});return next}
function setCartQty(cart,id,qty,variantId=null){if(qty<=0)return removeFromCart(cart,id,variantId);const key=variantId?String(variantId):null;return normalizeCart(cart).map(x=>x.id===id&&x.variantId===key?{...x,qty:Math.min(99,Math.floor(qty))}:x)}
function removeFromCart(cart,id,variantId=null){const key=variantId?String(variantId):null;return normalizeCart(cart).filter(x=>!(x.id===id&&x.variantId===key))}
function cartSubtotal(cart){return normalizeCart(cart).reduce((s,x)=>s+getProduct(x.id).price*x.qty,0)}
function calculateTotals(cart,{vatRate=.15,discount=0}={}){const subtotal=cartSubtotal(cart),safeDiscount=Math.min(subtotal,Math.max(0,Number(discount)||0)),taxable=subtotal-safeDiscount,vat=Math.round(taxable*Math.max(0,Number(vatRate)||0));return{subtotal,discount:safeDiscount,vat,total:taxable+vat}}
function validateCheckout(v={}){const errors={};if(!String(v.name||"").trim())errors.name="required";if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v.email||"")))errors.email="invalid";if(!String(v.phone||"").trim())errors.phone="required";if(!String(v.city||"").trim())errors.city="required";return{valid:Object.keys(errors).length===0,errors}}
function localeRoute(locale,path=""){const p=String(path).replace(/^\/+/, "");return locale==="ar"?`/ar/store/${p}`:`/store/${p}`}
function cartTotal(cart){return cartSubtotal(cart)}
const CATALOG=[{id:"website-development",price:8900,name:{en:"Website Development",ar:"تطوير المواقع"}},...PRODUCTS.map(p=>({id:p.id,price:p.price,name:{en:p.en.name,ar:p.ar.name}}))];
window.ASolutionStore={PRODUCTS,CATEGORIES,getProduct,formatMoney,normalizeCart,addToCart,setCartQty,removeFromCart,cartSubtotal,calculateTotals,validateCheckout,localeRoute,cartTotal,CATALOG};
})();