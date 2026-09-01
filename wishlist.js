(function(){'use strict';
const locale=document.documentElement.lang==='ar'?'ar':'en',box=document.querySelector('#wishlist-grid');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function readLocal(){try{const v=JSON.parse(localStorage.getItem('asolution_wishlist_local')||'[]');return Array.isArray(v)?v.filter(x=>typeof x==='string'):[]}catch{return[]}}
function mapRemote(p){return{id:p.slug,en:{name:p.name_en||p.slug,eyebrow:p.eyebrow_en||'A SOLUTION',desc:p.description_en||''},ar:{name:p.name_ar||p.name_en||p.slug,eyebrow:p.eyebrow_ar||p.eyebrow_en||'A SOLUTION',desc:p.description_ar||p.description_en||''}}}
function card(p){const t=p[locale]||p.en;return `<article class="card"><small>${esc(t.eyebrow)}</small><h3>${esc(t.name)}</h3><p>${esc(t.desc)}</p><a class="pill" href="product.html?id=${encodeURIComponent(p.id)}">${locale==='ar'?'عرض الحل':'VIEW SOLUTION'} ↗</a></article>`}
async function run(){if(!box)return;let ids=readLocal(),remote=[];try{const [wish,catalog]=await Promise.all([ASolutionRemote.myWishlist(),ASolutionRemote.listProducts()]);remote=(catalog||[]).map(mapRemote);const slugs=(wish||[]).map(x=>x.commerce_products?.slug).filter(Boolean);ids=[...new Set([...ids,...slugs])]}catch{}const remoteMap=new Map(remote.map(p=>[p.id,p]));const rows=ids.map(id=>remoteMap.get(id)||ASolutionStore.getProduct(id)).filter(Boolean);box.innerHTML=rows.length?rows.map(card).join(''):`<p>${locale==='ar'?'لا توجد عناصر محفوظة.':'No saved solutions yet.'}</p>`}
run();
})();