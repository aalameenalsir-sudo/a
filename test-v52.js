const fs=require('fs');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const css=fs.readFileSync(__dirname+'/styles.css','utf8');
const js=fs.readFileSync(__dirname+'/script.js','utf8');
const checks=[
 ['GSAP core loaded', html.includes('gsap.min.js')],
 ['ScrollTrigger loaded', html.includes('ScrollTrigger.min.js')],
 ['cinematic canvas layer', html.includes('class="cinematic-lines"')],
 ['service chapter labels', html.includes('scene-word')],
 ['hero depth styles', css.includes('.hero-depth')],
 ['motion scene styles', css.includes('.motion-beam')],
 ['GSAP registration', js.includes('gsap.registerPlugin(ScrollTrigger)')],
 ['hero scroll timeline', js.includes('heroTimeline')],
 ['service cinematic timeline', js.includes('serviceTimeline')],
 ['project reveal motion', js.includes('initProjectMotion')],
 ['reduced motion fallback', js.includes('if(reduced)')]
];
let failed=0;
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
process.exit(failed?1:0);
