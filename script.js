const PUBLIC_EMAIL='aalameenalsir@gmail.com';
(()=>{
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(pointer:fine)').matches;
const year=$('#year'); if(year) year.textContent=new Date().getFullYear();
setTimeout(()=>document.body.classList.add('ready'),250);

const progress=$('.scroll-progress'),spine=$('.brand-spine'),sceneA=$('.scene-a'),sceneWord=$('.scene-word'),rail=$('.scene-rail i'),current=$('#scene-current'),label=$('#scene-label'),trail=$('.cursor-trail'),cursor=$('.cursor'),topbar=$('.topbar');
let mx=innerWidth/2,my=innerHeight/2,tx=mx,ty=my;

if(!reduced&&fine){
  addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;if(cursor){cursor.style.left=mx+'px';cursor.style.top=my+'px'}});
  $$('a,button,.case-card,.service-panel').forEach(el=>{el.addEventListener('mouseenter',()=>cursor?.classList.add('view'));el.addEventListener('mouseleave',()=>cursor?.classList.remove('view'))});
  $$('.magnetic').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.14}px,${(e.clientY-r.top-r.height/2)*.14}px)`});el.addEventListener('pointerleave',()=>el.style.transform='')});
}

function frame(){
  if(!reduced&&fine){
    tx+=(mx-tx)*.12;ty+=(my-ty)*.12;
    if(trail){trail.style.left=tx+'px';trail.style.top=ty+'px'}
    const hx=(mx/innerWidth-.5),hy=(my/innerHeight-.5);
    if(spine&&window.gsap) gsap.set(spine,{x:hx*46,y:hy*36,overwrite:'auto'});
    else if(spine) spine.style.transform=`translateY(-48%) translate(${hx*46}px,${hy*36}px) rotate(${hx*5}deg)`;
  }
  requestAnimationFrame(frame)
} requestAnimationFrame(frame);

const panels=$$('.service-panel');
const serviceMedia=$$('[data-service-media]');
const mediaCaption=$('.media-caption');
function syncServiceMedia(no, panel){
  serviceMedia.forEach(media=>media.classList.toggle('active',media.dataset.serviceMedia===no));
  if(mediaCaption&&panel){mediaCaption.innerHTML=`<b>VISUAL / ${no}</b><span>${panel.querySelector('small')?.textContent||panel.dataset.label}</span>`;}
}
const serviceWords=['CREATE','BUILD','CONNECT','ORGANIZE','EXPERIENCE','ADVISE','AMPLIFY'];
const io=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(!e.isIntersecting)return;
  panels.forEach(p=>p.classList.remove('active'));
  const p=e.target;p.classList.add('active');const idx=panels.indexOf(p);const tone=p.dataset.tone;
  document.documentElement.style.setProperty('--tone','var(--brand)');syncServiceMedia(p.dataset.no,p);if(current)current.textContent=p.dataset.no;if(label)label.textContent=p.dataset.label;if(sceneWord)sceneWord.textContent=serviceWords[idx]||'A SOLUTION';if(rail)rail.style.transform=`translateY(${idx*100}%)`;
  if(sceneA&&!reduced&&!window.gsap)sceneA.animate([{transform:`scale(.78) rotate(${idx%2?-7:7}deg)`,opacity:.25},{transform:`scale(1) rotate(${idx%2?3:-3}deg)`,opacity:1}],{duration:650,easing:'cubic-bezier(.16,1,.3,1)'})
}),{rootMargin:'-42% 0px -42% 0px',threshold:.05});panels.forEach(p=>io.observe(p));

function onScroll(){
  const max=document.documentElement.scrollHeight-innerHeight;if(progress)progress.style.transform=`scaleX(${max?scrollY/max:0})`;topbar?.classList.toggle('scrolled',scrollY>80);
  if(reduced)return;
  $$('[data-speed]').forEach(el=>{const r=el.getBoundingClientRect();const d=(innerHeight*.5-r.top)*parseFloat(el.dataset.speed)*.08;el.style.setProperty('--drift',`${Math.max(-100,Math.min(100,d))}px`)});
  if(!window.gsap){const process=$('.process'),track=$('.process-track');if(process&&track&&innerWidth>800){const r=process.getBoundingClientRect();const span=Math.max(1,process.offsetHeight-innerHeight);const p=Math.max(0,Math.min(1,-r.top/span));const overflow=Math.max(0,track.scrollWidth-(innerWidth-parseFloat(getComputedStyle(process).paddingLeft)*2));track.style.transform=`translateX(${-overflow*p}px)`}}
} addEventListener('scroll',onScroll,{passive:true});onScroll();

function initCinematicMotion(){
  if(reduced) return;
  if(!window.gsap||!window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const ease='power3.out';
  gsap.set('.hero-line i',{yPercent:115,rotate:2,filter:'blur(8px)'});
  gsap.set('.eyebrow',{y:22,opacity:0});
  const heroTimeline=gsap.timeline({delay:1.65,defaults:{ease}});
  heroTimeline.to('.eyebrow',{y:0,opacity:1,duration:.7}).to('.hero-line i',{yPercent:0,rotate:0,filter:'blur(0px)',duration:1.05,stagger:.11},'-=.4').from('.hero-bottom',{y:35,opacity:0,duration:.8},'-=.55').from('.hero-stamp',{scale:.8,rotate:-8,opacity:0,duration:.7},'-=.7');

  gsap.to('.brand-spine',{yPercent:34,scale:.82,rotate:8,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1.25}});
  gsap.to('.d1',{xPercent:-32,yPercent:42,rotate:10,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1.6}});
  gsap.to('.d2',{xPercent:24,yPercent:-28,rotate:-12,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1.2}});
  gsap.to('.d3',{xPercent:-18,yPercent:-70,rotate:8,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1.4}});
  gsap.to('.cinematic-lines path',{strokeDashoffset:-260,ease:'none',scrollTrigger:{trigger:'body',start:'top top',end:'bottom bottom',scrub:1}});

  $$('.manifest-lines p').forEach((el,i)=>gsap.fromTo(el,{xPercent:i%2?-10:10,opacity:.2},{xPercent:0,opacity:1,ease:'none',scrollTrigger:{trigger:el,start:'top 92%',end:'center 45%',scrub:1}}));

  const serviceTimeline=gsap.timeline({scrollTrigger:{trigger:'.service-scene',start:'top top',end:'bottom bottom',scrub:1}});
  serviceTimeline.to('.scene-ring',{rotation:540,ease:'none'},0).to('.scene-a',{rotation:22,scale:1.12,ease:'none'},0).to('.scene-a-mask',{rotation:-8,scale:1.04,ease:'none'},0).to('.service-media-stage',{scale:1.08,rotation:2,ease:'none'},0).to('.scene-word',{yPercent:-110,rotation:-82,ease:'none'},0).to('.beam-a',{xPercent:420,rotation:42,ease:'none'},0).to('.beam-b',{xPercent:-380,rotation:-38,ease:'none'},0);

  panels.forEach((panel,i)=>{
    gsap.fromTo(panel,{opacity:.16,y:55,filter:'blur(8px)'},{opacity:1,y:0,filter:'blur(0px)',scrollTrigger:{trigger:panel,start:'top 72%',end:'center 52%',scrub:.8}});
    gsap.from(panel.querySelectorAll('h3, p, li'),{y:32,opacity:0,stagger:.045,ease:'power2.out',scrollTrigger:{trigger:panel,start:'top 64%',toggleActions:'play none none reverse'}});
  });

  const process=$('.process'),track=$('.process-track');
  if(process&&track&&innerWidth>800){const getX=()=>-(track.scrollWidth-innerWidth+parseFloat(getComputedStyle(process).paddingLeft)*2);gsap.to(track,{x:getX,ease:'none',scrollTrigger:{trigger:process,start:'top top',end:()=>`+=${Math.max(innerWidth,track.scrollWidth*.9)}`,pin:true,scrub:1,invalidateOnRefresh:true,anticipatePin:1}})}

  initProjectMotion();
  gsap.from('.identity-logo img',{scale:.72,rotate:-4,filter:'blur(10px)',scrollTrigger:{trigger:'.identity-break',start:'top 75%',end:'center 52%',scrub:1}});
  gsap.to('.contact-title h2',{xPercent:-4,letterSpacing:'-.095em',ease:'none',scrollTrigger:{trigger:'.contact',start:'top bottom',end:'center center',scrub:1}});
  gsap.to('.contact-orbit',{rotation:368,scale:1.1,ease:'none',scrollTrigger:{trigger:'.contact',start:'top bottom',end:'bottom bottom',scrub:1.2}});
  ScrollTrigger.refresh();
}

function initProjectMotion(){
  if(reduced||!window.gsap||!window.ScrollTrigger)return;
  $$('.case-card').forEach((card,i)=>{
    gsap.fromTo(card,{scale:.93,rotate:i%2?1.2:-1.2,filter:'blur(8px)',opacity:.55},{scale:1,rotate:0,filter:'blur(0px)',opacity:1,scrollTrigger:{trigger:card,start:'top 92%',end:'top 22%',scrub:1}});
    const mark=$('.case-mark',card);if(mark)gsap.to(mark,{xPercent:-14,rotation:i%2?8:-12,ease:'none',scrollTrigger:{trigger:card,start:'top bottom',end:'bottom top',scrub:1.2}})
  })
}


const cfg=window.ASOLUTION_SUPABASE;const db=cfg&&window.supabase?window.supabase.createClient(cfg.url,cfg.key):null;

function setText(sel,value,root=document){const el=$(sel,root);if(el&&value!==undefined&&value!==null)el.textContent=value}
function setSplit(sel,title,accent,root=document){const el=$(sel,root);if(!el)return;el.textContent='';el.append(document.createTextNode(title||''),document.createElement('br'));const em=document.createElement('em');em.textContent=accent||'';el.append(em)}
function ensureMeta(attr,name,value){if(!value)return;let el=document.head.querySelector(`meta[${attr}="${name}"]`);if(!el){el=document.createElement('meta');el.setAttribute(attr,name);document.head.appendChild(el)}el.setAttribute('content',value)}
function applyHomeCms(cms){
 if(!cms) return;
 const lang=document.documentElement.lang==='ar'?'ar':'en',d=cms[lang];if(!d)return;
 setText('.hero .eyebrow',d.hero?.eyebrow);const heroLines=$$('.hero-line i');if(heroLines[0]&&d.hero?.line1)heroLines[0].textContent=d.hero.line1;if(heroLines[1]&&d.hero?.line2)heroLines[1].textContent=d.hero.line2;if(heroLines[2]&&d.hero?.line3)heroLines[2].textContent=d.hero.line3;
 setText('.hero-bottom>p',d.hero?.description);if(d.hero?.cta){const cta=$('.round-link');if(cta){const b=$('b',cta);cta.childNodes.forEach(n=>{if(n.nodeType===3)n.remove()});cta.insertBefore(document.createTextNode(d.hero.cta+' '),b)}}
 setText('.manifest-label',d.manifest?.label);const ml=$$('.manifest-lines p');[d.manifest?.line1,d.manifest?.line2,d.manifest?.line3].forEach((v,i)=>{if(ml[i]&&v)ml[i].textContent=v});setText('.manifest-note p',d.manifest?.note);
 setText('.cap-intro>span',d.capabilities?.kicker);setSplit('.cap-intro h2',d.capabilities?.title,d.capabilities?.accent);setText('.cap-intro>p',d.capabilities?.description);
 setText('.process-head>span',d.process?.kicker);setSplit('.process-head h2',d.process?.title,d.process?.accent);$$('.process-track article').forEach((a,i)=>{const x=d.process?.items?.[i];if(!x)return;setText('h3',x.title,a);setText('p',x.text,a)});
 setText('.work-head>span',d.work?.kicker);setSplit('.work-head h2',d.work?.title,d.work?.accent);setText('.work-head>p',d.work?.description);
 setText('.contact-top>span',d.contact?.kicker);setText('.contact-top>p',d.contact?.prompt);setSplit('.contact-title h2',d.contact?.title,d.contact?.accent);setText('.contact-orbit',d.contact?.orbit);setText('.contact-info>p',d.contact?.description);
 const vis=d.visibility||{};const visibilityMap={manifest:'.brand-manifest',services:'.capabilities',process:'.process',work:'.work',contact:'.contact'};Object.entries(visibilityMap).forEach(([k,s])=>{const el=$(s);if(el)el.hidden=vis[k]===false});
}
function applyServicesCms(cms){
 if(!cms?.items?.length) return;
 const lang=document.documentElement.lang==='ar'?'ar':'en';
 cms.items.forEach((s,i)=>{const panel=$(`.service-panel[data-no="${s.no}"]`),media=$(`[data-service-media="${s.no}"]`);if(!panel)return;const d=s[lang]||s.en||{};panel.hidden=s.active===false;panel.dataset.label=d.label||panel.dataset.label;setText('small',d.category,panel);setSplit('h3',d.title,d.accent,panel);setText('p',d.description,panel);const ul=$('ul',panel);if(ul&&Array.isArray(d.items)){ul.textContent='';d.items.forEach(x=>{const li=document.createElement('li');li.textContent=x;ul.appendChild(li)})}if(media){media.hidden=s.active===false;if(s.image_url)media.style.setProperty('--media',`url("${String(s.image_url).replace(/"/g,'')}")`)}});
 const visible=cms.items.filter(x=>x.active!==false);const total=$('.scene-count span');if(total)total.textContent=`/ ${String(visible.length).padStart(2,'0')}`;
}
function applySeoCms(cms){
 if(!cms) return;const lang=document.documentElement.lang==='ar'?'ar':'en',d=cms[lang];if(!d)return;if(d.title)document.title=d.title;ensureMeta('name','description',d.description);ensureMeta('property','og:title',d.og_title||d.title);ensureMeta('property','og:description',d.og_description||d.description);
}
async function loadCmsContent(){
 if(!db)return;try{const{data,error}=await db.from('site_content').select('content_key,value').in('content_key',['home','services','seo']);if(error)throw error;const cms=Object.fromEntries((data||[]).map(x=>[x.content_key,x.value]));if(!cms) return;applyHomeCms(cms.home);applyServicesCms(cms.services);applySeoCms(cms.seo);requestAnimationFrame(()=>window.ScrollTrigger?.refresh())}catch(e){console.warn('CMS content unavailable; using static fallback.',e)}
}

async function loadSettings(){if(!db)return;try{const{data,error}=await db.from('settings').select('*').limit(1).maybeSingle();if(error||!data)return;const email=data.email||data.contact_email||PUBLIC_EMAIL,phone=data.phone||data.contact_phone,location=data.location||data.address;const e=$('#contact-email');if(e){e.textContent=email;e.href=`mailto:${email}`}if(phone){const e=$('#contact-phone');e.textContent=phone;e.href=`tel:${phone.replace(/[^+\d]/g,'')}`}if(location)$('#contact-location').textContent=location;const links=[['Instagram',data.instagram],['X',data.x_url||data.x||data.twitter],['LinkedIn',data.linkedin],['TikTok',data.tiktok],['Snapchat',data.snapchat]];const box=$('#socials');links.filter(x=>x[1]).forEach(([n,u])=>{const a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener';a.textContent=n;box.appendChild(a)})}catch(e){console.warn('Settings unavailable',e)}}
async function loadProjects(){if(!db)return;try{const{data,error}=await db.from('projects').select('*').eq('is_published',true).order('sort_order',{ascending:true}).order('created_at',{ascending:false}).limit(5);if(error||!data?.length)return;const list=$('#project-list');list.innerHTML='';data.forEach((p,i)=>{const a=document.createElement('article');a.className='case-card';a.style.top=`${7+i*3}vh`;const isAr=document.documentElement.lang==='ar',title=(isAr&&p.title_ar)||p.title||p.name||`Project ${i+1}`,cat=(isAr&&p.category_ar)||p.category||p.service||'A Solution',desc=(isAr&&p.description_ar)||p.description||p.summary||'A Solution project.';a.innerHTML=`<div class="case-no">${String(i+1).padStart(2,'0')}</div><div class="case-copy"><small></small><h3></h3><p></p></div><div class="case-mark">${String(title).charAt(0).toUpperCase()}</div>`;a.querySelector('small').textContent=cat;a.querySelector('h3').textContent=title;a.querySelector('p').textContent=desc;list.appendChild(a)});requestAnimationFrame(()=>{initProjectMotion();window.ScrollTrigger?.refresh()})}catch(e){console.warn('Projects unavailable',e)}}
const form=$('#contact-form');form.addEventListener('submit',async e=>{e.preventDefault();const status=$('#form-status'),btn=$('button',form);if(!db){status.textContent='Connection is temporarily unavailable.';return}const fd=new FormData(form),payload={name:String(fd.get('name')).trim(),email:String(fd.get('email')).trim(),phone:String(fd.get('phone')).trim(),message:String(fd.get('message')).trim(),status:'new'};btn.disabled=true;status.textContent='Sending…';try{const{error}=await db.from('messages').insert(payload);if(error)throw error;form.reset();status.textContent='Received. We’ll be in touch.'}catch(err){console.error(err);status.textContent='Could not send right now. Please email us directly.'}finally{btn.disabled=false}});

loadCmsContent();loadSettings();loadProjects();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initCinematicMotion);else initCinematicMotion();
})();


(()=>{const $$=(s,c=document)=>[...c.querySelectorAll(s)];
function preloadServiceMedia(){
  const urls=$$('[data-service-media]').map(el=>{
    const raw=getComputedStyle(el).getPropertyValue('--media').trim();
    return raw.replace(/^url\(["']?|["']?\)$/g,'');
  }).filter(Boolean);
  urls.forEach((url,i)=>{
    const img=new Image();
    if(i>1) img.loading='lazy';
    img.decoding='async';
    img.src=url;
  });
}

function initActiveNavigation(){
  const links=$$('.topbar nav a[href^="#"]');
  const sections=links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if(!sections.length)return;
  const update=()=>{
    document.querySelector('.topbar')?.classList.toggle('is-scrolled',scrollY>24);
    let current='';
    sections.forEach(section=>{
      if(section.getBoundingClientRect().top<=innerHeight*.42) current='#'+section.id;
    });
    links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')===current));
  };
  addEventListener('scroll',update,{passive:true});
  update();
}

preloadServiceMedia();
initActiveNavigation();
const publicEmailNode=document.querySelector('#contact-email');
if(publicEmailNode&&!publicEmailNode.textContent.trim()){publicEmailNode.textContent=PUBLIC_EMAIL;publicEmailNode.href=`mailto:${PUBLIC_EMAIL}`;}

})();
