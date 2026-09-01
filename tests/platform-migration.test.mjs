import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const dir=new URL('../supabase/migrations/',import.meta.url);const sql=fs.readdirSync(dir).filter(x=>x.endsWith('.sql')).sort().map(x=>fs.readFileSync(new URL(x,dir),'utf8')).join('\n');
for(const table of ['commerce_branches','commerce_digital_files','commerce_digital_entitlements','commerce_service_jobs','commerce_service_files','commerce_staff_roles','commerce_automation_rules','commerce_automation_events','commerce_notification_templates'])test(`migration defines ${table}`,()=>assert.match(sql,new RegExp(`create table if not exists public\\.${table}`)));
test('migration is additive and never resets production',()=>{assert.doesNotMatch(sql,/drop\s+table|truncate\s+table|db\s+reset/i);});
test('migration protects private storage buckets',()=>{assert.match(sql,/commerce-digital-files','commerce-digital-files',false/);assert.match(sql,/commerce-service-files','commerce-service-files',false/);});
test('migration supports role based permissions',()=>{assert.match(sql,/commerce_has_permission/);for(const role of ['owner','store_manager','sales_crm','fulfillment','finance','marketing','support','viewer'])assert.match(sql,new RegExp(role));});
test('atomic order commit owns inventory and fulfillment side effects',()=>{assert.match(sql,/commerce_commit_order/);assert.match(sql,/for update/);assert.match(sql,/commerce_digital_entitlements/);assert.match(sql,/commerce_service_jobs/);assert.match(sql,/lifetime_value=lifetime_value\+o.total/);});
test('security hardening restores address policy and blocks direct coupon mutation rpc',()=>{const s=fs.readFileSync(new URL('../supabase/migrations/20260901092459_commerce_security_advisor_fixes.sql',import.meta.url),'utf8');assert.match(s,/commerce addresses self/);assert.match(s,/revoke all on function public\.commerce_increment_coupon_use\(text\)/);assert.match(s,/anon,authenticated/);});
test('financial hardening migration reserves refunds under a row lock',()=>{const s=fs.readFileSync(new URL('../supabase/migrations/20260901092805_commerce_financial_hardening.sql',import.meta.url),'utf8');assert.match(s,/commerce_reserve_refund/);assert.match(s,/for update/i);assert.match(s,/status in \('pending','succeeded'\)/i);assert.match(s,/Refund exceeds paid total/);assert.match(s,/revoke all on function public\.commerce_reserve_refund/);});
test('commerce performance migration covers high-traffic foreign keys',()=>{const s=fs.readFileSync(new URL('../supabase/migrations/20260901093232_commerce_performance_indexes.sql',import.meta.url),'utf8');for(const expected of ['commerce_order_items_order_fk_idx','commerce_payments_order_fk_idx','commerce_variants_product_fk_idx','commerce_returns_order_fk_idx','commerce_reviews_product_fk_idx','commerce_shipments_order_fk_idx','commerce_digital_files_product_fk_idx','commerce_service_files_job_fk_idx'])assert.match(s,new RegExp(expected));});

test('security migrations remove public helper RPC execution and retain authenticated access',()=>{
  const s1=fs.readFileSync(new URL('../supabase/migrations/20260901093426_commerce_revoke_anon_helper_rpcs.sql',import.meta.url),'utf8');
  const s2=fs.readFileSync(new URL('../supabase/migrations/20260901093512_commerce_lock_helper_rpcs.sql',import.meta.url),'utf8');
  for(const fn of ['commerce_staff_role','commerce_has_permission','commerce_is_admin']){
    assert.match(s1,new RegExp(`revoke execute on function public\\.${fn}`));
    assert.match(s2,new RegExp(`revoke execute on function public\\.${fn}`));
  }
  assert.match(s2,/from public/);
  assert.match(s2,/to authenticated/);
});
