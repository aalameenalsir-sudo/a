// Mock datasets for admin UI
window.MockData = {
  totals: {
    sales: '$12,430',
    customers: 842,
    orders: 213,
    products: 54
  },
  charts: {
    sales: [120, 200, 150, 300, 260, 340, 290, 360, 400, 380]
  },
  activity: [
    { user: 'سارة', action: 'أنشأت طلباً جديداً', time: 'قبل 10 دقائق' },
    { user: 'محمد', action: 'عدل منتج', time: 'قبل 30 دقيقة' },
    { user: 'نورة', action: 'أرسلت رسالة', time: 'قبل ساعة' },
    { user: 'عميل', action: 'أكمل عملية شراء', time: 'منذ 3 ساعات' }
  ],
  users: [
    { id: 1, name: 'سارة أحمد', email: 'sara@example.com', role: 'admin', active:true },
    { id: 2, name: 'محمد علي', email: 'moh@example.com', role: 'manager', active:true },
    { id: 3, name: 'نورة حسين', email: 'nora@example.com', role: 'editor', active:false }
  ],
  orders: [
    { id: 101, customer: 'سارة أحمد', total: 120.5, status: 'مكتمل', date: '2026-08-20' },
    { id: 102, customer: 'علي', total: 75.0, status: 'قيد التنفيذ', date: '2026-08-21' }
  ],
  products: [
    { id: 'SKU-001', name: 'منتج أ', sku: 'SKU-001', price: 29.99 },
    { id: 'SKU-002', name: 'منتج ب', sku: 'SKU-002', price: 49.00 }
  ],
  messages: [
    { id:1, from:'عميل', subject:'استفسار عن المنتج', preview:'مرحبا، أريد معرفة المزيد...' , date: '2026-08-28' }
  ]
};
