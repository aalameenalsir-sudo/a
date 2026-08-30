
const fs=require('fs');
const h=fs.readFileSync('index.html','utf8');
const c=fs.readFileSync('styles.css','utf8');
const j=fs.readFileSync('script.js','utf8');

const checks=[
 ['new public email in HTML', h.includes('mailto:aalameenalsir@gmail.com') && h.includes('>aalameenalsir@gmail.com<')],
 ['email protected from Supabase override', j.includes("PUBLIC_EMAIL='aalameenalsir@gmail.com'") && !j.includes("e.textContent=email;e.href=`mailto:${email}`")],
 ['V5.4 polish marker', h.includes('data-build="v5.4"')],
 ['active navigation polish', c.includes('.topbar nav a.active') && j.includes('initActiveNavigation')],
 ['touch cursor protection', c.includes('@media(pointer:coarse)') && c.includes('.cursor,.cursor-trail')],
 ['service image preload', j.includes('preloadServiceMedia')],
 ['accessible keyboard focus', c.includes(':focus-visible')],
 ['reduced motion remains', c.includes('prefers-reduced-motion')]
];

let bad=0;
for(const [name,ok] of checks){
  console.log(`${ok?'PASS':'FAIL'} ${name}`);
  if(!ok) bad++;
}
process.exit(bad?1:0);
