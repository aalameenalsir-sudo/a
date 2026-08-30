
const cfg=window.ASOLUTION_SUPABASE;
const db=window.supabase.createClient(cfg.url,cfg.key);
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
let state={home:null,services:null,seo:null,settings:null,projects:[],messages:[],lang:'en'};

function toast(msg,error=false){const el=$('#toast');el.textContent=msg;el.className='toast show'+(error?' error':'');setTimeout(()=>el.className='toast',2600)}
function esc(v=''){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function input(label,path,value='',type='text',full=false){const control=type==='textarea'?`<textarea data-path="${esc(path)}">${esc(value)}</textarea>`:`<input data-path="${esc(path)}" type="${type}" value="${esc(value)}">`;return `<label class="field ${full?'full':''}"><span>${esc(label)}</span>${control}</label>`}
function getPath(obj,path){return path.split('.').reduce((a,k)=>a?.[k],obj)}
function setPath(obj,path,val){const ks=path.split('.');let t=obj;ks.slice(0,-1).forEach(k=>t=t[k]??={});t[ks.at(-1)]=val}
function collect(root,obj){$$('[data-path]',root).forEach(el=>setPath(obj,el.dataset.path,el.type==='checkbox'?el.checked:el.value))}

async function requireAdmin(){
 const {data:{session}}=await db.auth.getSession();
 if(!session)return false;
 const {data:profile}=await db.from('profiles').select('role').eq('id',session.user.id).maybeSingle();
 if(!profile||profile.role !== 'admin'){await db.auth.signOut();toast('This account is not an admin.',true);return false}
 $('#admin-email').textContent=session.user.email;return true;
}
async function showApp(){if(!(await requireAdmin()))return;$('#login-screen').hidden=true;$('#app').hidden=false;await loadAll()}
async function login(e){e.preventDefault();const status=$('#login-status');status.textContent='Signing in…';const {data,error}=await db.auth.signInWithPassword({email:$('#login-email').value.trim(),password:$('#login-password').value});if(error){status.textContent=error.message;return}if(!(await requireAdmin())){status.textContent='Admin access required.';return}status.textContent='';$('#login-screen').hidden=true;$('#app').hidden=false;await loadAll()}
async function logout(){await db.auth.signOut();location.reload()}

async function fetchContent(key){const {data,error}=await db.from('site_content').select('value').eq('content_key',key).maybeSingle();if(error)throw error;return data?.value||{}}
async function saveContent(key,value){const {error}=await db.from('site_content').upsert({content_key:key,value,updated_at:new Date().toISOString()},{onConflict:'content_key'});if(error)throw error}

async function loadAll(){
 try{
  const [home,services,seo,settings,projects,messages]=await Promise.all([
   fetchContent('home'),fetchContent('services'),fetchContent('seo'),
   db.from('settings').select('*').limit(1).maybeSingle(),
   db.from('projects').select('*').order('sort_order',{ascending:true}).order('created_at',{ascending:false}),
   db.from('messages').select('*').order('created_at',{ascending:false}).limit(100)
  ]);
  state.home=home;state.services=services;state.seo=seo;state.settings=settings.data||{};state.projects=projects.data||[];state.messages=messages.data||[];
  renderContent();renderServices();renderSettings();renderProjects();renderSeo();renderMessages();updateStats();
 }catch(e){console.error(e);toast('Could not load Admin data.',true)}
}
function updateStats(){
 $('#stat-messages').textContent=state.messages.filter(x=>x.status==='new').length;
 $('#stat-projects').textContent=state.projects.filter(x=>x.is_published).length;
 $('#stat-services').textContent=(state.services.items||[]).filter(x=>x.active!==false).length;
 const n=state.messages.filter(x=>x.status==='new').length;$('#message-badge').textContent=n||'';
}

function renderContent(){
 const lang=state.lang, d=state.home?.[lang]||{}, root=$('#content-editor');root.dir=lang==='ar'?'rtl':'ltr';
 root.innerHTML=`
 <div class="editor-section"><h3>Hero</h3><div class="form-grid">
 ${input('Eyebrow','hero.eyebrow',d.hero?.eyebrow)}${input('Line 1','hero.line1',d.hero?.line1)}
 ${input('Line 2','hero.line2',d.hero?.line2)}${input('Accent line','hero.line3',d.hero?.line3)}
 ${input('Description','hero.description',d.hero?.description,'textarea',true)}${input('CTA','hero.cta',d.hero?.cta)}
 </div></div>
 <div class="editor-section"><h3>Manifest</h3><div class="form-grid">
 ${input('Label','manifest.label',d.manifest?.label)}${input('Line 1','manifest.line1',d.manifest?.line1)}
 ${input('Line 2','manifest.line2',d.manifest?.line2)}${input('Line 3','manifest.line3',d.manifest?.line3)}
 ${input('Note','manifest.note',d.manifest?.note,'textarea',true)}</div></div>
 <div class="editor-section"><h3>Capabilities intro</h3><div class="form-grid">
 ${input('Kicker','capabilities.kicker',d.capabilities?.kicker)}${input('Title','capabilities.title',d.capabilities?.title)}
 ${input('Accent','capabilities.accent',d.capabilities?.accent)}${input('Description','capabilities.description',d.capabilities?.description,'textarea',true)}</div></div>
 <div class="editor-section"><h3>Process</h3><div class="form-grid">
 ${input('Kicker','process.kicker',d.process?.kicker)}${input('Title','process.title',d.process?.title)}${input('Accent','process.accent',d.process?.accent)}
 ${(d.process?.items||[]).map((x,i)=>input(`Step ${i+1} title`,`process.items.${i}.title`,x.title)+input(`Step ${i+1} text`,`process.items.${i}.text`,x.text,'textarea')).join('')}
 </div></div>
 <div class="editor-section"><h3>Work & Contact</h3><div class="form-grid">
 ${input('Work kicker','work.kicker',d.work?.kicker)}${input('Work title','work.title',d.work?.title)}${input('Work accent','work.accent',d.work?.accent)}
 ${input('Work description','work.description',d.work?.description,'textarea',true)}
 ${input('Contact kicker','contact.kicker',d.contact?.kicker)}${input('Contact prompt','contact.prompt',d.contact?.prompt)}
 ${input('Contact title','contact.title',d.contact?.title)}${input('Contact accent','contact.accent',d.contact?.accent)}
 ${input('Contact orbit','contact.orbit',d.contact?.orbit)}${input('Contact description','contact.description',d.contact?.description,'textarea',true)}
 </div></div>
 <div class="editor-section"><h3>Section visibility</h3><div class="checks">${['manifest','services','process','work','contact'].map(k=>`<label><input type="checkbox" data-visibility="${k}" ${d.visibility?.[k]!==false?'checked':''}> ${k}</label>`).join('')}</div></div>`;
}
async function saveHome(){
 const lang=state.lang;state.home[lang]=state.home[lang]||{};collect($('#content-editor'),state.home[lang]);
 $$('[data-visibility]',$('#content-editor')).forEach(el=>{state.home[lang].visibility=state.home[lang].visibility||{};state.home[lang].visibility[el.dataset.visibility]=el.checked});
 try{await saveContent('home',state.home);toast('Website content saved.')}catch(e){toast(e.message,true)}
}

function renderServices(){
 const root=$('#services-editor'),items=state.services?.items||[];
 root.innerHTML=items.map((s,i)=>`<article class="service-card" data-service="${i}">
 <div class="service-head"><div><small>SERVICE ${s.no}</small><h3>${esc(s.en?.category||'Service')}</h3></div><div class="service-preview" style="background-image:url('${esc(s.image_url)}')"></div></div>
 <div class="form-grid" style="margin-top:14px">${input('Image URL','image_url',s.image_url,'text',true)}${input('Motion word','word',s.word)}
 <label class="field"><span>Visible</span><select data-path="active"><option value="true" ${s.active!==false?'selected':''}>Yes</option><option value="false" ${s.active===false?'selected':''}>No</option></select></label></div>
 <div class="service-grid"><div class="lang-column"><h4>English</h4>
 ${input('Scene label','en.label',s.en?.label)}${input('Category','en.category',s.en?.category)}${input('Title','en.title',s.en?.title)}${input('Accent','en.accent',s.en?.accent)}${input('Description','en.description',s.en?.description,'textarea')}
 ${(s.en?.items||[]).map((v,n)=>input(`Item ${n+1}`,`en.items.${n}`,v)).join('')}</div>
 <div class="lang-column" dir="rtl"><h4>العربية</h4>
 ${input('عنوان المشهد','ar.label',s.ar?.label)}${input('اسم الخدمة','ar.category',s.ar?.category)}${input('العنوان','ar.title',s.ar?.title)}${input('الكلمة البارزة','ar.accent',s.ar?.accent)}${input('الوصف','ar.description',s.ar?.description,'textarea')}
 ${(s.ar?.items||[]).map((v,n)=>input(`البند ${n+1}`,`ar.items.${n}`,v)).join('')}</div></div></article>`).join('');
}
async function saveServices(){
 $$('.service-card',$('#services-editor')).forEach(card=>{const s=state.services.items[+card.dataset.service];$$('[data-path]',card).forEach(el=>{let v=el.value;if(el.dataset.path==='active')v=v==='true';setPath(s,el.dataset.path,v)})});
 try{await saveContent('services',state.services);toast('Services saved.')}catch(e){toast(e.message,true)}
}

function renderSettings(){
 const s=state.settings||{},fields=[['Site name','site_name'],['Email','email'],['Phone','phone'],['WhatsApp','whatsapp'],['Location','location'],['Instagram','instagram'],['X / Twitter','x_url'],['LinkedIn','linkedin'],['TikTok','tiktok'],['Snapchat','snapchat']];
 $('#settings-editor').innerHTML=fields.map(([l,k])=>input(l,k,s[k]||'',k==='email'?'email':'text',k==='location')).join('');
}
async function saveSettings(e){e.preventDefault();collect($('#settings-editor'),state.settings);const payload={...state.settings};delete payload.id;delete payload.created_at;try{const id=state.settings.id;const q=id?db.from('settings').update(payload).eq('id',id):db.from('settings').insert(payload);const {error}=await q;if(error)throw error;toast('Contact & social settings saved.')}catch(e){toast(e.message,true)}}

function renderSeo(){
 const root=$('#seo-editor');root.innerHTML=['en','ar'].map(lang=>{const d=state.seo?.[lang]||{};return `<div class="editor-section" dir="${lang==='ar'?'rtl':'ltr'}"><h3>${lang==='en'?'English':'العربية'}</h3><div class="form-grid">${input('Page title',`${lang}.title`,d.title,'text',true)}${input('Meta description',`${lang}.description`,d.description,'textarea',true)}${input('Open Graph title',`${lang}.og_title`,d.og_title,'text',true)}${input('Open Graph description',`${lang}.og_description`,d.og_description,'textarea',true)}</div></div>`}).join('');
}
async function saveSeo(){collect($('#seo-editor'),state.seo);try{await saveContent('seo',state.seo);toast('SEO saved.')}catch(e){toast(e.message,true)}}

function projectTemplate(p,i){return `<article class="project-card" data-project="${p.id||''}" data-index="${i}">
 <div class="project-head"><div><small>${p.id?'PROJECT #'+p.id:'NEW PROJECT'}</small><h3>${esc(p.title||'Untitled project')}</h3></div>${p.image_url?`<img src="${esc(p.image_url)}" alt="">`:''}</div>
 <div class="form-grid" style="margin-top:15px">
 ${input('English title','title',p.title||'')}${input('Arabic title','title_ar',p.title_ar||'')}
 ${input('English category','category',p.category||'')}${input('Arabic category','category_ar',p.category_ar||'')}
 ${input('English description','description',p.description||'','textarea')}${input('Arabic description','description_ar',p.description_ar||'','textarea')}
 ${input('Image URL','image_url',p.image_url||'','text',true)}${input('Project URL','project_url',p.project_url||'','text',true)}${input('Order','sort_order',p.sort_order??0,'number')}
 <label class="field"><span>Published</span><select data-path="is_published"><option value="true" ${p.is_published!==false?'selected':''}>Yes</option><option value="false" ${p.is_published===false?'selected':''}>No</option></select></label>
 <label class="field full"><span>Upload image</span><input class="project-upload" type="file" accept="image/png,image/jpeg,image/webp"></label>
 </div><div class="project-actions" style="margin-top:14px"><button class="save-project primary">Save project</button>${p.id?'<button class="delete-project danger">Delete</button>':''}</div></article>`}
function renderProjects(){$('#projects-editor').innerHTML=state.projects.map(projectTemplate).join('')||'<p>No projects yet.</p>'}
async function uploadProjectImage(file){const ext=(file.name.split('.').pop()||'jpg').toLowerCase(),path=`projects/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;const {error}=await db.storage.from('project-images').upload(path,file,{upsert:false});if(error)throw error;return db.storage.from('project-images').getPublicUrl(path).data.publicUrl}
async function saveProject(card){
 let p={};$$('[data-path]',card).forEach(el=>{let v=el.value;if(el.dataset.path==='is_published')v=v==='true';if(el.dataset.path==='sort_order')v=Number(v||0);p[el.dataset.path]=v});
 const file=$('.project-upload',card)?.files?.[0];if(file)p.image_url=await uploadProjectImage(file);
 const id=card.dataset.project;try{let res=id?await db.from('projects').update(p).eq('id',id).select().single():await db.from('projects').insert(p).select().single();if(res.error)throw res.error;toast('Project saved.');await reloadProjects()}catch(e){toast(e.message,true)}
}
async function deleteProject(card){if(!confirm('Delete this project?'))return;const {error}=await db.from('projects').delete().eq('id',card.dataset.project);if(error)return toast(error.message,true);toast('Project deleted.');await reloadProjects()}
async function reloadProjects(){const {data,error}=await db.from('projects').select('*').order('sort_order',{ascending:true}).order('created_at',{ascending:false});if(error)return toast(error.message,true);state.projects=data||[];renderProjects();updateStats()}

function renderMessages(){
 const root=$('#messages-list');root.innerHTML=state.messages.map(m=>`<article class="message-card" data-message="${m.id}"><div class="message-head"><div><b>${esc(m.name||'Unknown')}</b><small> · ${esc(m.email||'')} · ${new Date(m.created_at).toLocaleString()}</small></div><select class="message-status"><option ${m.status==='new'?'selected':''}>new</option><option ${m.status==='read'?'selected':''}>read</option><option ${m.status==='closed'?'selected':''}>closed</option></select></div><p>${esc(m.message||'')}</p>${m.phone?`<small>${esc(m.phone)}</small>`:''}</article>`).join('')||'<p>No messages.</p>';
}
async function refreshMessages(){const {data,error}=await db.from('messages').select('*').order('created_at',{ascending:false}).limit(100);if(error)return toast(error.message,true);state.messages=data||[];renderMessages();updateStats()}
async function updateMessage(el){const card=el.closest('.message-card');const {error}=await db.from('messages').update({status:el.value}).eq('id',card.dataset.message);if(error)return toast(error.message,true);const m=state.messages.find(x=>String(x.id)===card.dataset.message);if(m)m.status=el.value;updateStats();toast('Message updated.')}

$$('.nav-btn').forEach(b=>b.addEventListener('click',()=>{$$('.nav-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');$$('.view').forEach(v=>v.classList.toggle('active',v.dataset.view===b.dataset.target));$('#view-title').textContent=b.textContent.replace(/\d+/g,'').trim()}));
$$('.lang-tab').forEach(b=>b.addEventListener('click',()=>{$$('.lang-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.lang=b.dataset.lang;renderContent()}));
$('#login-form').addEventListener('submit',login);$('#logout-btn').addEventListener('click',logout);$('#save-content').addEventListener('click',saveHome);$('#save-services').addEventListener('click',saveServices);$('#settings-form').addEventListener('submit',saveSettings);$('#save-seo').addEventListener('click',saveSeo);$('#refresh-messages').addEventListener('click',refreshMessages);
$('#new-project').addEventListener('click',()=>{state.projects.unshift({title:'',title_ar:'',description:'',description_ar:'',category:'',category_ar:'',image_url:'',project_url:'',sort_order:0,is_published:true});renderProjects();$('#projects-editor').scrollIntoView({behavior:'smooth'})});
$('#projects-editor').addEventListener('click',e=>{const card=e.target.closest('.project-card');if(e.target.closest('.save-project'))saveProject(card);if(e.target.closest('.delete-project'))deleteProject(card)});
$('#messages-list').addEventListener('change',e=>{if(e.target.classList.contains('message-status'))updateMessage(e.target)});
db.auth.onAuthStateChange((_event,session)=>{if(!session&&!$('#app').hidden)location.reload()});
showApp();