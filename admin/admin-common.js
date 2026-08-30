
const Admin = {
  esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));},
  money(v){return new Intl.NumberFormat('en-SA',{style:'currency',currency:'SAR',maximumFractionDigits:2}).format(Number(v||0));},
  date(v){if(!v)return '—'; return new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(v+'T00:00:00'));},
  async requireAdmin(){
    const {data:{session}}=await supabaseClient.auth.getSession();
    if(!session){location.href='index.html';return null}
    const {data,error}=await supabaseClient.from('profiles').select('role').eq('id',session.user.id).single();
    if(error||data?.role!=='admin'){await supabaseClient.auth.signOut();location.href='index.html';return null}
    return session.user;
  },
  async logout(){await supabaseClient.auth.signOut();location.href='index.html';},
  toast(msg){let t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)},
  openModal(){document.getElementById('modal')?.classList.add('show')},
  closeModal(){document.getElementById('modal')?.classList.remove('show')},
  nav(){
    return `<div class="brand">A <span>Solution</span></div><div class="nav">
    <div class="nav-title">Overview</div><a href="dashboard.html">Dashboard</a>
    <div class="nav-title">CRM</div><a href="clients.html">Clients</a><a href="opportunities.html">Opportunities</a><a href="crm.html">Activities</a>
    <div class="nav-title">Work</div><a href="client-projects.html">Client Projects</a><a href="tasks.html">Tasks</a><a href="campaigns.html">Campaigns</a><a href="employees.html">Employees</a>
    <div class="nav-title">Sales</div><a href="quotations.html">Quotations</a><a href="contracts.html">Contracts</a>
    <div class="nav-title">Finance</div><a href="invoices.html">Invoices</a><a href="payments.html">Payments</a><a href="expenses.html">Expenses</a><a href="reports.html">Reports</a>
    <div class="nav-title">Content</div><a href="projects.html">Public Projects</a><a href="messages.html">Messages</a>
    <div class="nav-title">System</div><a href="documents.html">Documents</a><a href="notifications.html">Notifications</a><a href="settings.html">Settings</a>
    </div>`;
  },
  shell(title,subtitle=''){
    document.querySelector('.sidebar').innerHTML=this.nav();
    document.querySelector('#pageTitle').textContent=title;
    document.querySelector('#pageSub').textContent=subtitle;
  }
};
