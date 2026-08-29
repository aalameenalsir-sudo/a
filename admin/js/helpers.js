// Simple helpers for formatting used in admin pages
window.helpers = (function(){
  function formatCurrency(v){
    if (typeof v === 'number') return v.toLocaleString('ar-EG', { style:'currency', currency:'USD' });
    return v;
  }
  function formatDate(d){
    try{ const dt = new Date(d); return dt.toLocaleDateString('ar-EG'); }catch(e){ return d; }
  }
  return { formatCurrency, formatDate };
})();
