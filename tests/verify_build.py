from pathlib import Path
p=Path(__file__).parents[1]
html=(p/'index.html').read_text() if (p/'index.html').exists() else ''
css=(p/'styles.css').read_text() if (p/'styles.css').exists() else ''
js=(p/'script.js').read_text() if (p/'script.js').exists() else ''
checks={
 'brand_logo_reused':'a-solution-logo.png' in html,
 'cinematic_intro':'cinematic-intro' in html,
 'brand_spine':'brand-spine' in html,
 'sticky_service_story':'service-scene' in html and 'service-detail' in html,
 'all_core_services':all(x in html for x in ['Digital Marketing','Website Development','App Development','CCTV','Business Organization','Event Production','Management Consulting']),
 'showcase':'case-stage' in html,
 'supabase':'ASOLUTION_SUPABASE' in html and "from('messages')" in js,
 'motion_engine':'requestAnimationFrame' in js and 'pointermove' in js,
 'reduced_motion':'prefers-reduced-motion' in css and 'prefers-reduced-motion' in js,
 'responsive':'@media(max-width:800px)' in css,
}
failed=[k for k,v in checks.items() if not v]
print('\n'.join(f"{k}: {'PASS' if v else 'FAIL'}" for k,v in checks.items()))
if failed: raise SystemExit('FAILED: '+', '.join(failed))
