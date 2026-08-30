const fs=require('fs');
const h=fs.readFileSync('index.html','utf8');
const c=fs.readFileSync('styles.css','utf8');
const j=fs.readFileSync('script.js','utf8');
const checks=[
 ['seven service visuals',(h.match(/data-service-media=/g)||[]).length===7],
 ['A visual viewport',h.includes('service-media-stage') && h.includes('scene-a-mask')],
 ['brand coral token',c.includes('--brand:#ff6b6b')],
 ['brand-driven service treatment',c.includes('.service-media-stage') && c.includes('mix-blend-mode')],
 ['media scene switching',j.includes('syncServiceMedia')],
 ['cinematic media motion',j.includes('service-media-stage') && j.includes('scale:1.08')],
 ['reduced motion remains',c.includes('prefers-reduced-motion')]
];
let bad=0; for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${n}`);if(!ok)bad++;} process.exit(bad?1:0);
