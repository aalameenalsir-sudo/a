// Dashboard logic: renders stat cards, charts, recent activity, quick actions
window.Dashboard = (function(){
  function init(){
    renderStatCards();
    renderSalesChart();
    renderRecentActivity();
    renderQuickActions();
  }

  function renderStatCards(){
    const container = document.getElementById('stat-cards');
    const stats = [
      {label: 'إجمالي المبيعات', value: MockData.totals.sales},
      {label: 'العملاء', value: MockData.totals.customers},
      {label: 'الطلبات', value: MockData.totals.orders},
      {label: 'المنتجات', value: MockData.totals.products}
    ];
    stats.forEach(s=>{
      const el = document.createElement('div');
      el.className = 'stat-card p-4';
      el.innerHTML = `<div class="kpi">${s.value}</div><div class="kpi-sub">${s.label}</div>`;
      container.appendChild(el);
    });
  }

  function renderSalesChart(){
    const el = document.getElementById('sales-chart');
    const series = MockData.charts.sales;
    // simple SVG sparkline
    const w = el.clientWidth || 800;
    const h = 180;
    const max = Math.max(...series);
    const min = Math.min(...series);
    const points = series.map((v,i)=>{
      const x = (i/(series.length-1)) * (w-40) + 20;
      const y = h - ((v - min)/(max-min || 1)) * (h-40) - 20;
      return `${x},${y}`;
    }).join(' ');
    el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" class="w-full h-full"><polyline fill="none" stroke="var(--primary)" stroke-width="2" points="${points}" /></svg>`;
  }

  function renderRecentActivity(){
    const el = document.getElementById('recent-activity');
    MockData.activity.slice(0,6).forEach(a=>{
      const d = document.createElement('div');
      d.className = 'p-3 border rounded';
      d.innerHTML = `<div class="text-sm"><strong>${a.user}</strong> — <span class="text-muted-foreground">${a.action}</span></div><div class="text-xs text-muted-foreground">${a.time}</div>`;
      el.appendChild(d);
    });
  }

  function renderQuickActions(){
    const el = document.getElementById('quick-actions');
    const actions = ['إضافة منتج', 'تصدير تقارير', 'إنشاء عرض', 'إرسال رسالة'];
    actions.forEach(a=>{
      const b = document.createElement('button');
      b.className = 'px-3 py-2 rounded bg-primary text-primary-foreground';
      b.textContent = a;
      el.appendChild(b);
    });
  }

  function renderSmallCharts(){
    // used by reports page for small visuals
    document.querySelectorAll('[id^="report-"]').forEach(el=>{
      el.innerHTML = '<svg viewBox="0 0 100 30" class="w-full h-full"><polyline fill="none" stroke="var(--primary)" stroke-width="2" points="0,20 20,10 40,15 60,5 80,12 100,8" /></svg>';
    });
  }

  return { init, renderSmallCharts };
})();
