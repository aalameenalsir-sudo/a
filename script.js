(() => {
  const root = document.documentElement;
  const cursor = document.querySelector('.cursor');
  const progress = document.querySelector('.progress span');
  const aObject = document.querySelector('.a-object');
  const serviceWord = document.querySelector('.service-word');
  const serviceIndex = document.querySelector('.service-index');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  if (!reduced && matchMedia('(pointer:fine)').matches) {
    addEventListener('pointermove', e => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      const x = (e.clientX / innerWidth - .5) * 16;
      const y = (e.clientY / innerHeight - .5) * 12;
      if (aObject) aObject.style.transform = `translateY(-50%) translate(${x}px,${y}px) rotate(${x * .08}deg)`;
    });
    document.querySelectorAll('a,button,.project').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('big'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
    });
  }

  const reveals = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('in');
  }), {threshold:.14});
  document.querySelectorAll('.reveal').forEach(el => reveals.observe(el));

  const serviceObserver = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    document.querySelectorAll('.service').forEach(s => s.classList.remove('active'));
    e.target.classList.add('active');
    serviceWord.textContent = e.target.dataset.word;
    serviceIndex.textContent = e.target.dataset.index;
    serviceWord.style.color = e.target.dataset.accent;
  }), {rootMargin:'-35% 0px -35% 0px', threshold:.05});
  document.querySelectorAll('.service').forEach(el => serviceObserver.observe(el));

  addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max ? scrollY / max : 0})`;
    if (!reduced) {
      document.querySelectorAll('.kinetic').forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const shift = Math.max(-80, Math.min(80, (innerHeight * .55 - r.top) * (i % 2 ? -.035 : .035)));
        el.style.setProperty('--shift', `${shift}px`);
      });
    }
  }, {passive:true});

  document.querySelectorAll('.magnetic').forEach(el => {
    if (reduced) return;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.12}px,${(e.clientY-r.top-r.height/2)*.12}px)`;
    });
    el.addEventListener('pointerleave', () => el.style.transform = '');
  });

  const cfg = window.ASOLUTION_SUPABASE;
  const db = cfg && window.supabase ? window.supabase.createClient(cfg.url, cfg.key) : null;

  async function loadSettings() {
    if (!db) return;
    try {
      const {data, error} = await db.from('settings').select('*').limit(1).maybeSingle();
      if (error || !data) return;
      const email = data.email || data.contact_email;
      const phone = data.phone || data.contact_phone;
      const location = data.location || data.address;
      if (email) { const el=document.getElementById('contact-email'); el.textContent=email; el.href=`mailto:${email}`; }
      if (phone) { const el=document.getElementById('contact-phone'); el.textContent=phone; el.href=`tel:${phone.replace(/[^+\d]/g,'')}`; }
      if (location) document.getElementById('contact-location').textContent=location;
      const socialMap = [['Instagram',data.instagram],['X',data.x || data.twitter],['LinkedIn',data.linkedin],['TikTok',data.tiktok],['Snapchat',data.snapchat]];
      const box=document.getElementById('socials');
      socialMap.filter(([,url])=>url).forEach(([name,url])=>{const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';a.textContent=name;box.appendChild(a)});
    } catch (_) {}
  }

  async function loadProjects() {
    if (!db) return;
    try {
      const {data,error}=await db.from('projects').select('*').eq('published',true).order('created_at',{ascending:false}).limit(6);
      if(error || !data?.length) return;
      const list=document.getElementById('project-list'); list.innerHTML='';
      data.forEach((p,i)=>{
        const title=p.title || p.name || `Project ${i+1}`;
        const cat=p.category || p.service || 'A Solution';
        const article=document.createElement('article'); article.className='project';
        article.innerHTML=`<span class="project-no">${String(i+1).padStart(2,'0')}</span><div><small></small><h3></h3></div><span class="project-arrow">↗</span>`;
        article.querySelector('small').textContent=cat; article.querySelector('h3').textContent=title;
        list.appendChild(article);
      });
    } catch (_) {}
  }

  const form=document.getElementById('contact-form');
  form.addEventListener('submit', async e => {
    e.preventDefault(); const status=document.getElementById('form-status'); const btn=form.querySelector('button');
    if(!db){status.textContent='Connection is temporarily unavailable.';return}
    const fd=new FormData(form); btn.disabled=true; status.textContent='Sending…';
    const payload={name:fd.get('name').trim(),email:fd.get('email').trim(),phone:fd.get('phone').trim(),message:fd.get('message').trim(),status:'new'};
    try{const {error}=await db.from('messages').insert(payload);if(error)throw error;form.reset();status.textContent='Received. We’ll be in touch.'}catch(err){console.error(err);status.textContent='Could not send right now. Please email us directly.'}finally{btn.disabled=false}
  });

  loadSettings(); loadProjects();
})();
