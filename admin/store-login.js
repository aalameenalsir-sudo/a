(function(){
'use strict';
const cfg={url:'https://bgxtcpcbkjftkgswpizr.supabase.co',key:'sb_publishable_t9MKvlsLheyCj-o-jIQ04A_9sGI_j_r'};
const client=window.supabase.createClient(cfg.url,cfg.key);
const form=document.querySelector('#store-login-form'),status=document.querySelector('#store-login-status');
function safeNext(){const raw=new URLSearchParams(location.search).get('next')||'store-dashboard.html';return /^store-[a-z0-9-]+\.html(?:[?#].*)?$/i.test(raw)?raw:'store-dashboard.html'}
(async()=>{const {data}=await client.auth.getSession();if(data?.session){const {data:profile}=await client.from('profiles').select('role').eq('id',data.session.user.id).maybeSingle();if(profile?.role==='admin')location.replace(safeNext())}})();
form.addEventListener('submit',async e=>{e.preventDefault();status.textContent='Signing in…';const d=Object.fromEntries(new FormData(form));const {data,error}=await client.auth.signInWithPassword({email:String(d.email||'').trim(),password:String(d.password||'')});if(error||!data?.user){status.textContent=error?.message||'Unable to sign in.';return}const {data:profile,error:profileError}=await client.from('profiles').select('role').eq('id',data.user.id).maybeSingle();if(profileError||profile?.role!=='admin'){await client.auth.signOut();status.textContent='This account does not have store administrator access.';return}location.replace(safeNext())});
})();
