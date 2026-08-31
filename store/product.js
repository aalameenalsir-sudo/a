(function(){
'use strict';
const locale=document.documentElement.lang==='ar'?'ar':'en';
const KEY='asolution_cart_v2';
const id=new URLSearchParams(location.search).get('id');
const root=document.querySelector('#product-root');
const c=locale==='ar'?{bad:'الحل غير موجود',from:'ابتداءً من',add:'أضف للسلة',includes:'يشمل',reviews:'آراء العملاء',back:'العودة للمتجر'}:{bad:'Solution not found',from:'FROM',add:'ADD TO CART',includes:'INCLUDES',reviews:'CLIENT REVIEWS',back:'BACK TO STORE'};
const visualMap={'web-launch':'web-launch.svg',commerce:'commerce.svg','brand-system':'brand-system.svg',growth:'growth.svg',crm:'crm.svg',social:'social.svg'};
function visualForProduct(pid){const file=visualMap[pid]||'web-launch.svg';return locale==='ar'?`../../store/assets/visuals/${file}`:`assets/visuals/${file}`}
function safeReadCart(){try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function safeSaveCart(cart){try{localStorage.setItem(KEY,JSON.stringify(cart))}catch{}}
function render(p){
  if(!root)return;
  if(!p){root.innerHTML=`<div class="product-copy"><span class="section-no">A SOLUTION / STORE</span><h1>${c.bad}</h1><a class="primary-cta" href="index.html">${c.back} ↗</a></div>`;return}
  const t=p[locale]||p.en;
  root.innerHTML=`<div class="product-art premium-product-art"><img class="product-art-img" src="${visualForProduct(p.id)}" alt="${String(t.name).replace(/"/g,'&quot;')} visual"><div class="product-art-mark">A</div></div><div class="product-copy premium-product-copy"><small>${t.eyebrow||'A SOLUTION'}</small><h1>${t.name}</h1><p class="product-lead">${t.desc||''}</p><h3>${c.includes}</h3><ul>${(t.bullets||[]).map(x=>`<li>${x}</li>`).join('')}</ul><div class="price product-price">${c.from} ${ASolutionStore.formatMoney(p.price,locale)}</div><button class="primary product-add" id="product-add">${c.add} +</button><div id="product-reviews" class="reviews-block"><h3>${c.reviews}</h3></div></div>`;
  const add=document.querySelector('#product-add');
  if(add)add.onclick=()=>{let cart=safeReadCart();cart=ASolutionStore.addToCart(cart,p.id);safeSaveCart(cart);location.href='index.html'};
  loadReviews(p);
}
async function loadReviews(p){const box=document.querySelector('#product-reviews');if(!box)return;try{const rows=await ASolutionRemote.listProducts(),rp=rows?.find(x=>x.slug===p.id);if(!rp)return;const reviews=await ASolutionRemote.listReviews(rp.id);box.innerHTML+=reviews?.length?reviews.map(r=>`<article class="review"><b>${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</b><h4>${r.title||''}</h4><p>${r.body||''}</p></article>`).join(''):`<p>${locale==='ar'?'لا توجد تقييمات منشورة بعد.':'No published reviews yet.'}</p>`}catch{box.innerHTML+=`<p>${locale==='ar'?'التقييمات متاحة عند الاتصال.':'Reviews are available when connected.'}</p>`}}
async function run(){let p=ASolutionStore.getProduct(id);render(p);try{const rows=await ASolutionRemote.listProducts(),r=rows?.find(x=>x.slug===id);if(r){p={id:r.slug,price:Number(r.price),en:{name:r.name_en,eyebrow:r.eyebrow_en||'A SOLUTION',desc:r.description_en||'',bullets:Array.isArray(r.features_en)?r.features_en:[]},ar:{name:r.name_ar||r.name_en,eyebrow:r.eyebrow_ar||'A SOLUTION',desc:r.description_ar||r.description_en||'',bullets:Array.isArray(r.features_ar)?r.features_ar:[]}};render(p)}}catch{}}
run();
window.ASolutionProduct={visualForProduct};
})();
