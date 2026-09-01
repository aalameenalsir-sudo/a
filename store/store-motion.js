(()=>{'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals=[...document.querySelectorAll('[data-reveal]')];
if(reduced){reveals.forEach(x=>x.classList.add('is-visible'));return}
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.14});
reveals.forEach(x=>io.observe(x));
const media=[...document.querySelectorAll('.parallax-media')];
let ticking=false;function move(){const h=innerHeight;media.forEach(el=>{const r=el.parentElement.getBoundingClientRect(),p=(r.top+h)/(h+r.height);el.style.transform=`translate3d(0,${(p-.5)*42}px,0) scale(1.035)`});ticking=false}
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(move);ticking=true}},{passive:true});move();
const bar=document.querySelector('.scroll-progress');addEventListener('scroll',()=>{if(!bar)return;const d=document.documentElement,m=d.scrollHeight-d.clientHeight,p=m?d.scrollTop/m:0;bar.style.background=`linear-gradient(90deg,var(--coral) ${p*100}%,transparent ${p*100}%)`},{passive:true});
})();