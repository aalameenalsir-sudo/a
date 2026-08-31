select table_name from information_schema.tables where table_schema='public' and table_name in ('store_products','orders','order_items','payments','customers');
select tablename,rowsecurity from pg_tables where schemaname='public' and tablename in ('store_products','orders','customers');
