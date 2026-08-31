(function(){
'use strict';
const cfg={url:'https://bgxtcpcbkjftkgswpizr.supabase.co',key:'sb_publishable_t9MKvlsLheyCj-o-jIQ04A_9sGI_j_r'};
const loginTarget='store-login.html';
function getToken(){
  try{
    const direct=JSON.parse(localStorage.getItem('asolution_supabase_session')||'null');
    if(direct?.access_token)return direct.access_token;
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i)||'';
      if(k.startsWith('sb-')&&k.endsWith('-auth-token')){
        const v=JSON.parse(localStorage.getItem(k)||'null');
        const s=v?.access_token?v:v?.currentSession||v?.session;
        if(s?.access_token)return s.access_token;
      }
    }
  }catch{}
  return null;
}
function escapeHTML(value){
  return String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}
function jwtSubject(token){
  try{
    const part=token.split('.')[1];
    if(!part)return null;
    const normalized=part.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(part.length/4)*4,'=');
    return JSON.parse(atob(normalized))?.sub||null;
  }catch{return null;}
}
async function req(table,query='',opts={}){
  const token=getToken();
  if(!token)throw new Error('ADMIN_LOGIN_REQUIRED');
  const r=await fetch(`${cfg.url}/rest/v1/${table}${query}`,{
    ...opts,
    headers:{apikey:cfg.key,Authorization:`Bearer ${token}`,'Content-Type':'application/json',...(opts.headers||{})}
  });
  const text=await r.text();
  let data=null;
  try{data=text?JSON.parse(text):null}catch{data=text}
  if(!r.ok)throw new Error(data?.message||data?.error||`HTTP ${r.status}`);
  return data;
}
async function role(){
  const token=getToken();
  if(!token)return false;
  const sub=jwtSubject(token);
  if(!sub)return false;
  try{
    const rows=await req('profiles',`?id=eq.${encodeURIComponent(sub)}&select=role`);
    return rows?.[0]?.role==='admin';
  }catch{return false;}
}
function redirectToLogin(){
  const current=(location.pathname.split('/').pop()||'store-dashboard.html')+location.search+location.hash;
  location.replace(`${loginTarget}?next=${encodeURIComponent(current)}`);
}
async function signOut(){
  const token=getToken();
  try{
    if(token)await fetch(`${cfg.url}/auth/v1/logout`,{method:'POST',headers:{apikey:cfg.key,Authorization:`Bearer ${token}`}});
  }catch{}
  try{
    for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i)||'';if(k==='asolution_supabase_session'||(k.startsWith('sb-')&&k.endsWith('-auth-token')))localStorage.removeItem(k)}
  }catch{}
  location.replace(loginTarget);
}
function decorate(){
  const nav=document.querySelector('.admin-nav');
  if(!nav||nav.querySelector('[data-store-admin-tools]'))return;
  const tools=document.createElement('div');
  tools.dataset.storeAdminTools='1';
  tools.className='store-admin-tools';
  tools.innerHTML='<a href="../store/index.html" target="_blank" rel="noopener">View store ↗</a><button type="button" class="pill" data-store-logout>Sign out</button>';
  nav.appendChild(tools);
  tools.querySelector('[data-store-logout]').addEventListener('click',signOut);
}
async function guard(){
  if(!(await role())){redirectToLogin();throw new Error('ADMIN_FORBIDDEN');}
  decorate();
  return true;
}
function showError(target,error){
  const el=typeof target==='string'?document.querySelector(target):target;
  if(el){el.innerHTML=`<div class="admin-error">${escapeHTML(error?.message||error||'Something went wrong.')}</div>`;}
  console.error(error);
}
window.ASolutionAdmin={req,guard,getToken,escapeHTML,showError,signOut,cfg,loginTarget};
})();
