
(()=>{'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
const reveals=qa('[data-v4-reveal]');
if(reduced){reveals.forEach(x=>x.classList.add('v4-in'));return;}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('v4-in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -7%'});
reveals.forEach(io.observe.bind(io));
let ticking=false;
function frame(){
 const y=scrollY,h=innerHeight;
 qa('.v4-float').forEach((el,i)=>{const r=el.getBoundingClientRect(),p=(r.top-h*.5)/h;el.style.transform=`translate3d(0,${Math.max(-26,Math.min(26,-p*(i?13:20)))}px,0)`});
 const bg=q('.v4-hero-bg'); if(bg) bg.style.transform=`translate3d(0,${Math.min(38,y*.045)}px,0) scale(1.03)`;
 ticking=false;
}
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(frame);ticking=true}},{passive:true});frame();
qa('.v4-main-cta').forEach(btn=>{btn.addEventListener('pointermove',e=>{const r=btn.getBoundingClientRect();btn.style.setProperty('--mx',`${(e.clientX-r.left-r.width/2)*.07}px`);btn.style.setProperty('--my',`${(e.clientY-r.top-r.height/2)*.1}px`)});btn.addEventListener('pointerleave',()=>{btn.style.setProperty('--mx','0px');btn.style.setProperty('--my','0px')})});
const rail=q('.v4-solution-rail');
qa('[data-rail]').forEach(b=>b.addEventListener('click',()=>{if(!rail)return;const dir=Number(b.dataset.rail)||1;rail.scrollBy({left:dir*rail.clientWidth*.78,behavior:'smooth'})}));
if(rail){let down=false,start=0,left=0;rail.addEventListener('pointerdown',e=>{down=true;start=e.clientX;left=rail.scrollLeft;rail.setPointerCapture?.(e.pointerId)});rail.addEventListener('pointermove',e=>{if(down)rail.scrollLeft=left-(e.clientX-start)});['pointerup','pointercancel','pointerleave'].forEach(n=>rail.addEventListener(n,()=>down=false));}
})();
