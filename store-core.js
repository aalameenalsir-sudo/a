(function(){
const PRODUCTS = [
 {id:"web-launch",type:"service",category:"digital",price:8900,featured:true,
  en:{name:"Website Launch System",eyebrow:"WEB × DIGITAL",desc:"Strategy, UX direction, responsive build and launch for a distinctive business website.",bullets:["Strategy & structure","Responsive build","SEO foundation","Launch support"]},
  ar:{name:"نظام إطلاق موقع احترافي",eyebrow:"ويب × رقمي",desc:"استراتيجية وتجربة مستخدم وتطوير متجاوب وإطلاق لموقع أعمال مميز.",bullets:["الاستراتيجية والهيكلة","تطوير متجاوب","تهيئة SEO","دعم الإطلاق"]}},
 {id:"commerce",type:"service",category:"digital",price:12500,featured:true,
  en:{name:"Commerce Experience",eyebrow:"COMMERCE × SYSTEMS",desc:"A premium bilingual commerce experience with catalog, cart, checkout and operations.",bullets:["Arabic + English","Catalog & cart","Checkout flow","Admin operations"]},
  ar:{name:"تجربة متجر إلكتروني",eyebrow:"تجارة × أنظمة",desc:"تجربة تجارة إلكترونية فاخرة ثنائية اللغة تشمل الكتالوج والسلة والدفع والتشغيل.",bullets:["عربي + إنجليزي","كتالوج وسلة","مسار شراء","إدارة التشغيل"]}},
 {id:"brand-system",type:"service",category:"creative",price:6000,featured:true,
  en:{name:"Brand Identity System",eyebrow:"BRAND × CREATIVE",desc:"A coherent visual system built to make the business recognizable everywhere.",bullets:["Creative direction","Identity system","Brand applications","Launch toolkit"]},
  ar:{name:"نظام هوية بصرية",eyebrow:"هوية × إبداع",desc:"نظام بصري مترابط يجعل العلامة واضحة وقابلة للتطبيق في كل نقطة تواصل.",bullets:["توجيه إبداعي","نظام الهوية","تطبيقات العلامة","حزمة الإطلاق"]}},
 {id:"growth",type:"service",category:"marketing",price:8500,featured:true,
  en:{name:"Growth Campaign",eyebrow:"MARKETING × PERFORMANCE",desc:"Campaign strategy, creative production and performance setup built around measurable demand.",bullets:["Campaign strategy","Creative system","Paid media setup","Reporting"]},
  ar:{name:"حملة نمو وتسويق",eyebrow:"تسويق × أداء",desc:"استراتيجية وإنتاج إبداعي وإعداد حملات أداء مصممة حول طلب قابل للقياس.",bullets:["استراتيجية الحملة","نظام إبداعي","إعداد الإعلانات","تقارير"]}},
 {id:"crm",type:"service",category:"technology",price:15000,featured:false,
  en:{name:"CRM & Operations System",eyebrow:"TECH × BUSINESS",desc:"A connected customer, sales and operations workspace shaped around your workflow.",bullets:["CRM pipeline","Customers","Tasks & follow-ups","Management reporting"]},
  ar:{name:"نظام CRM وتشغيل",eyebrow:"تقنية × أعمال",desc:"مساحة مترابطة للعملاء والمبيعات والتشغيل مصممة حسب سير عمل الشركة.",bullets:["مسار مبيعات","العملاء","مهام ومتابعات","تقارير الإدارة"]}},
 {id:"social",type:"service",category:"marketing",price:4500,featured:false,
  en:{name:"Social Content System",eyebrow:"CONTENT × SOCIAL",desc:"Monthly content direction, production framework and publishing system.",bullets:["Content strategy","Monthly calendar","Creative direction","Performance review"]},
  ar:{name:"نظام محتوى سوشيال",eyebrow:"محتوى × سوشيال",desc:"توجيه محتوى شهري وإطار إنتاج ونظام نشر ومراجعة أداء.",bullets:["استراتيجية محتوى","تقويم شهري","توجيه إبداعي","مراجعة الأداء"]}}
];

const CATEGORIES = {
 en:[["all","All Solutions"],["digital","Digital"],["creative","Creative"],["marketing","Marketing"],["technology","Technology"]],
 ar:[["all","كل الحلول"],["digital","رقمي"],["creative","إبداع"],["marketing","تسويق"],["technology","تقنية"]]
};

function getProduct(id){ return PRODUCTS.find(p=>p.id===id) || null; }
function formatMoney(amount,locale="en"){ return new Intl.NumberFormat(locale==="ar"?"ar-SA":"en-SA",{style:"currency",currency:"SAR",maximumFractionDigits:0}).format(Number(amount)||0); }
function normalizeCart(cart=[]){ return Array.isArray(cart)?cart.filter(x=>getProduct(x.id)&&Number(x.qty)>0).map(x=>({id:x.id,qty:Math.min(99,Math.max(1,Math.floor(Number(x.qty)))),variantId:x.variantId?String(x.variantId):null})):[]; }
function addToCart(cart,id,qty=1){ const next=normalizeCart(cart); const input=typeof id==="object"?id:{id}; const raw=input.id; const canonical=raw==="web"?"web-launch":raw; const variantId=input.variantId?String(input.variantId):null; const item=next.find(x=>x.id===canonical&&x.variantId===variantId); if(!getProduct(canonical)) return next; if(item)item.qty=Math.min(99,item.qty+Math.max(1,Math.floor(qty))); else next.push({id:canonical,qty:Math.max(1,Math.floor(qty)),variantId}); return next; }
function setCartQty(cart,id,qty,variantId=null){ if(qty<=0)return removeFromCart(cart,id,variantId); const key=variantId?String(variantId):null; return normalizeCart(cart).map(x=>x.id===id&&x.variantId===key?{...x,qty:Math.min(99,Math.floor(qty))}:x); }
function removeFromCart(cart,id,variantId=null){ const key=variantId?String(variantId):null; return normalizeCart(cart).filter(x=>!(x.id===id&&x.variantId===key)); }
function cartSubtotal(cart){ return normalizeCart(cart).reduce((s,x)=>s+getProduct(x.id).price*x.qty,0); }
function calculateTotals(cart,{vatRate=.15,discount=0}={}){ const subtotal=cartSubtotal(cart); const safeDiscount=Math.min(subtotal,Math.max(0,Number(discount)||0)); const taxable=subtotal-safeDiscount; const vat=Math.round(taxable*Math.max(0,Number(vatRate)||0)); return {subtotal,discount:safeDiscount,vat,total:taxable+vat}; }
function validateCheckout(v={}){ const errors={}; if(!String(v.name||"").trim())errors.name="required"; if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v.email||"")))errors.email="invalid"; if(!String(v.phone||"").trim())errors.phone="required"; if(!String(v.city||"").trim())errors.city="required"; return {valid:Object.keys(errors).length===0,errors}; }
function localeRoute(locale,path=""){ const p=String(path).replace(/^\/+/,""); return locale==="ar"?`/ar/store/${p}`:`/store/${p}`; }

function cartTotal(cart){ return cartSubtotal(cart); }
const CATALOG = [
 {id:"website-development",price:8900,name:{en:"Website Development",ar:"تطوير المواقع"}},
 ...PRODUCTS.map(p=>({id:p.id,price:p.price,name:{en:p.en.name,ar:p.ar.name}}))
];

window.ASolutionStore={PRODUCTS,CATEGORIES,getProduct,formatMoney,normalizeCart,addToCart,setCartQty,removeFromCart,cartSubtotal,calculateTotals,validateCheckout,localeRoute,cartTotal,CATALOG};

})();
