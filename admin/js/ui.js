// UI loader: inserts header and sidebar components into placeholders
window.UI = (function(){
  async function fetchText(path){
    const res = await fetch(path);
    return res.ok ? res.text() : '';
  }

  async function loadComponents(){
    const sidebarHtml = await fetchText('./components/sidebar.html');
    const headerHtml = await fetchText('./components/header.html');
    document.getElementById('sidebar-placeholder').innerHTML = sidebarHtml;
    document.getElementById('header-placeholder').innerHTML = headerHtml;

    // set year if placeholder present
    const yearEl = document.getElementById('admin-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Hook logout
    const logoutBtn = document.querySelector('[data-admin-logout]');
    if (logoutBtn) logoutBtn.addEventListener('click', ()=>{ window.AdminAuth.logout(); });

    // Sidebar toggle for mobile
    const toggle = document.querySelector('[data-sidebar-toggle]');
    const sidebar = document.querySelector('.admin-sidebar');
    if (toggle && sidebar){
      toggle.addEventListener('click', ()=>{
        const open = sidebar.classList.toggle('open');
        document.body.classList.toggle('admin-sidebar-open', open);
      });
    }

    return Promise.resolve();
  }

  return { loadComponents };
})();
