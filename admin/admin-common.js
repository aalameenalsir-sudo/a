
const Admin={
  esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));},
  money(v){return new Intl.NumberFormat('en-SA',{style:'currency',currency:'SAR',maximumFractionDigits:2}).format(Number(v||0));},
  date(v){if(!v)return '—';const d=new Date(String(v).length===10?v+'T00:00:00':v);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric'}).format(d);},
  datetime(v){if(!v)return '—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(d);},
  async requireAdmin(){const {data:{session}}=await supabaseClient.auth.getSession();if(!session){location.href='index.html';return null}const {data,error}=await supabaseClient.from('profiles').select('role').eq('id',session.user.id).single();if(error||data?.role!=='admin'){await supabaseClient.auth.signOut();location.href='index.html';return null}return session.user;},
  async logout(){await supabaseClient.auth.signOut();location.href='index.html';},
  toast(msg){let t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');clearTimeout(this._toast);this._toast=setTimeout(()=>t.classList.remove('show'),2200)},
  openModal(id='modal'){document.getElementById(id)?.classList.add('show')},closeModal(id='modal'){document.getElementById(id)?.classList.remove('show')},
  safeUrl(v){try{const u=new URL(v);return ['http:','https:'].includes(u.protocol)?u.href:null}catch{return null}},
  number(v){return Number(v||0)},
  id(v){const n=Number(v);return Number.isFinite(n)&&n>0?n:null},
  q(name){return new URLSearchParams(location.search).get(name)},
  generateNumber(prefix){const d=new Date();const p=n=>String(n).padStart(2,'0');return `${prefix}-${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`},
  nav(){return `<div class="brand">A <span>Solution</span></div><nav class="nav">
    <div class="nav-title">Overview</div><a href="dashboard.html">Dashboard</a>
    <div class="nav-title">CRM</div><a href="clients.html">Clients</a><a href="opportunities.html">Opportunities</a><a href="crm.html">Activities</a>
    <div class="nav-title">Work</div><a href="client-projects.html">Client Projects</a><a href="tasks.html">Tasks</a><a href="campaigns.html">Campaigns</a><a href="employees.html">Employees</a>
    <div class="nav-title">Sales</div><a href="quotations.html">Quotations</a><a href="contracts.html">Contracts</a>
    <div class="nav-title">Finance</div><a href="invoices.html">Invoices</a><a href="payments.html">Payments</a><a href="expenses.html">Expenses</a><a href="reports.html">Reports</a>
    <div class="nav-title">Content</div><a href="projects.html">Public Projects</a><a href="messages.html">Messages</a>
    <div class="nav-title">System</div><a href="documents.html">Documents</a><a href="notifications.html">Notifications</a><a href="activity.html">Activity Log</a><a href="settings.html">Settings</a></nav>`},
  setActiveNav(){const p=location.pathname.split('/').pop()||'dashboard.html';document.querySelectorAll('.nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')===p));},
  shell(title,subtitle=''){const s=document.querySelector('.sidebar');if(s){s.innerHTML=this.nav();this.setActiveNav()}const t=document.querySelector('#pageTitle');if(t)t.textContent=title;const sub=document.querySelector('#pageSub');if(sub)sub.textContent=subtitle;},
  toggleMenu(){document.querySelector('.sidebar')?.classList.toggle('open')},
  async loadSelect(el,table,{value='id',label='name',order=label,placeholder='Select',filters=[]}={}){if(typeof el==='string')el=document.querySelector(el);if(!el)return[];let q=supabaseClient.from(table).select(`${value},${label}`).order(order,{ascending:true});for(const f of filters)q=q.eq(f[0],f[1]);const {data,error}=await q;if(error){console.error(error);return[]}el.innerHTML=`<option value="">${this.esc(placeholder)}</option>`+(data||[]).map(r=>`<option value="${this.esc(r[value])}">${this.esc(r[label]??('#'+r[value]))}</option>`).join('');return data||[]},
  badge(v){const x=String(v||'').toLowerCase();const good=['active','won','paid','completed','published','replied','sent','approved','read'].includes(x);const bad=['lost','cancelled','overdue','closed'].includes(x);const warn=['pending','planned','proposal','negotiation','partial','draft','todo','new'].includes(x);return `<span class="badge ${good?'good':bad?'bad':warn?'warn':'info'}">${this.esc(v||'—')}</span>`},
  async log(action,entity_type,entity_id=null,details={}){try{const {data:{session}}=await supabaseClient.auth.getSession();if(!session)return;await supabaseClient.from('activity_log').insert({user_id:session.user.id,action,entity_type,entity_id,details})}catch(e){console.warn('log',e)}},
  bindModalClose(){document.addEventListener('click',e=>{if(e.target.classList?.contains('modal'))e.target.classList.remove('show')})}
};
Admin.bindModalClose();
