# A Solution Commerce

A bilingual A Solution commerce platform designed to extend the existing A Solution visual system while remaining reusable as a white-label commercial product.

## Storefront
English `/store/`, Arabic `/ar/store/`, true RTL, search, category filtering, product details, wishlist, cart, checkout, customer account, order history, tracking and reviews.

## Live Supabase backend
The connected Supabase project now contains namespaced `commerce_*` tables for settings, categories, products, variants, customers, addresses, orders, order items, payments, shipments, returns, refunds, coupons, wishlists, reviews, customer activities, abandoned carts and audit logs. RLS is enabled. The A Solution catalog is seeded.

Active Edge Functions:
- `commerce-create-order`: validates customer/cart data, re-reads prices server-side, validates coupons, calculates VAT, checks inventory, syncs the existing CRM customer table, creates the order/items and updates customer lifetime value.
- `commerce-track-order`: returns limited order status only when order number and matching email are supplied.

## Payment architecture
Invoice/bank transfer is active. Online card payment is provider-ready but cannot be activated safely without real merchant credentials and webhook secrets. Those secrets belong in server-side Edge Function environment variables only.

## Admin
Commerce dashboard, products/inventory, orders, customers/CRM, coupons, payments, returns/refunds, reviews, abandoned carts, reports and white-label settings are included. Admin pages expect the existing A Solution authenticated admin token and the existing `profiles.role='admin'` authorization model.

## Local preview
Run `OPEN_STORE.bat`. The browser storefront uses a local catalog fallback so it still renders if the network is unavailable; when Supabase is reachable it hydrates from the live `commerce_products` table.

## Automated verification
Run `node --test tests/*.test.mjs`.
All browser JavaScript can be syntax-checked with `node --check`.
