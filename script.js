(() => {
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  $('#year').textContent = new Date().getFullYear();

  // Header
  const header = $('[data-header]');
  const syncHeader = () => header.classList.toggle('scrolled', scrollY > 25);
  syncHeader(); addEventListener('scroll', syncHeader, { passive: true });

  // Mobile menu
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-mobile-menu]');
  toggle?.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('[data-mobile-menu] a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow='';
  }));

  // Reveal on scroll
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('in'); observer.unobserve(entry.target); }
  }), { threshold: .12, rootMargin: '0px 0px -7% 0px' });
  $$('.reveal').forEach(el => observer.observe(el));

  // Count up
  const countObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target, target = Number(el.dataset.count || 0), start = performance.now();
    const tick = now => { const p = Math.min(1,(now-start)/1100), eased=1-Math.pow(1-p,3); el.textContent=Math.round(target*eased)+(target===360?'°':''); if(p<1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick); countObserver.unobserve(el);
  }), { threshold:.5 });
  $$('[data-count]').forEach(el => countObserver.observe(el));

  if (!reduced) {
    // Parallax
    let ticking = false;
    addEventListener('scroll', () => { if (ticking) return; ticking=true; requestAnimationFrame(() => {
      $$('[data-parallax]').forEach(el => { const speed=Number(el.dataset.parallax||.05); const r=el.getBoundingClientRect(); const center=r.top+r.height/2-innerHeight/2; el.style.transform=`translate3d(0,${center*-speed}px,0)`; }); ticking=false;
    }); }, {passive:true});

    // 3D tilt with subtle motion
    $$('[data-tilt]').forEach(el => {
      el.addEventListener('pointermove', e => { const r=el.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5; el.style.transform=`perspective(900px) rotateX(${y*-3}deg) rotateY(${x*4}deg) scale(1.01)`; });
      el.addEventListener('pointerleave', () => el.style.transform='');
    });

    // Custom cursor
    const dot=$('.cursor-dot'), ring=$('.cursor-ring');
    addEventListener('pointermove', e => { if(!dot||!ring)return; dot.style.transform=`translate(${e.clientX-2.5}px,${e.clientY-2.5}px)`; ring.animate({transform:`translate(${e.clientX-17}px,${e.clientY-17}px)`},{duration:220,fill:'forwards'}); });
    $$('a,button,[data-tilt]').forEach(el => { el.addEventListener('pointerenter',()=>ring?.classList.add('active')); el.addEventListener('pointerleave',()=>ring?.classList.remove('active')); });

    // Magnetic buttons
    $$('.magnetic').forEach(el => { el.addEventListener('pointermove', e => { const r=el.getBoundingClientRect(); el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.08}px,${(e.clientY-r.top-r.height/2)*.12}px)`; }); el.addEventListener('pointerleave',()=>el.style.transform=''); });
  }

  // Optional Supabase integration. Keep current project values in window.ASOLUTION_SUPABASE.
  const config = window.ASOLUTION_SUPABASE;
  let db = null;
  if (config?.url && config?.key && window.supabase) db = window.supabase.createClient(config.url, config.key);

  const loadSettings = async () => {
    if (!db) return;
    try {
      const { data, error } = await db.from('settings').select('*').limit(1).maybeSingle();
      if (error || !data) return;
      const email = $('[data-setting-email]'), phone=$('[data-setting-phone]'), location=$('[data-setting-location]');
      if(data.email && email){email.textContent=data.email;email.href=`mailto:${data.email}`}
      if(data.phone && phone){phone.textContent=data.phone;phone.href=`tel:${String(data.phone).replace(/\s+/g,'')}`}
      if(data.location && location)location.textContent=data.location;
      ['instagram','linkedin','x_url','tiktok'].forEach(k=>{const a=$(`[data-social="${k}"]`);if(a&&data[k]){a.href=data[k];a.target='_blank';a.rel='noopener'}});
    } catch (_) {}
  };
  loadSettings();

  // Contact form: sends to Supabase when configured; otherwise opens email fallback.
  const form=$('#contactForm'), status=$('.form-status');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    if(!form.reportValidity()) return;
    const values=Object.fromEntries(new FormData(form).entries());
    const btn=$('button[type="submit"]',form); btn.disabled=true; status.textContent='Sending…';
    try {
      if(db){
        const { error }=await db.from('messages').insert({name:values.name,email:values.email,phone:values.phone||null,message:values.message});
        if(error) throw error;
        status.textContent='Thank you. We’ll be in touch shortly.'; form.reset();
      } else {
        const subject=encodeURIComponent(`New inquiry from ${values.name}`);
        const body=encodeURIComponent(`Name: ${values.name}\nEmail: ${values.email}\nPhone: ${values.phone||'-'}\n\n${values.message}`);
        location.href=`mailto:info@asolution.sa?subject=${subject}&body=${body}`;
        status.textContent='Your email app is opening…';
      }
    } catch(err){status.textContent='Could not send right now. Please email info@asolution.sa.'}
    finally{btn.disabled=false}
  });
})();
