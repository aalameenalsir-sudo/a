# A Solution Storefront Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the bilingual A Solution storefront foundation and then connect it to the commerce backend.

**Architecture:** Static storefront presentation remains independent from commerce state. `store-core.mjs` owns localized catalog and pure cart helpers; `store-app.js` binds browser behavior. English and Arabic pages share the same CSS, JS and catalog while keeping locale-specific semantic markup and SEO metadata.

**Tech Stack:** HTML5, CSS3, ES modules, Intl.NumberFormat, localStorage, existing A Solution fonts/assets, Supabase in the next commerce task.

**Spec:** `docs/superpowers/specs/2026-09-01-a-solution-storefront-design.md`

## Global Constraints
- English route: `/store/`.
- Arabic route: `/ar/store/`.
- Arabic must use true RTL layout.
- Default currency: SAR.
- No secret keys in browser code.
- Existing A Solution homepage must not be visually regressed.

---

### Task 1: Bilingual Storefront Foundation
**Files:**
- Create: `store/index.html`
- Create: `ar/store/index.html`
- Create: `store/store.css`
- Create: `store/store-core.mjs`
- Create: `store/store-app.js`
- Test: `tests/store.test.mjs`

**Interfaces:**
- Produces: `CATALOG`, `formatMoney(amount, locale)`, `addToCart(cart, product)`, `removeFromCart(cart, id)`, `cartTotal(cart)`, `localeRoute(locale)`.

- [x] Write failing tests for bilingual routes, localized catalog, money formatting and cart behavior.
- [x] Run tests and verify RED.
- [x] Implement the storefront foundation.
- [x] Run tests and verify GREEN.

### Task 2: Product Detail + Cart UX
**Files:**
- Create: `store/product.html`
- Create: `ar/store/product.html`
- Modify: `store/store-app.js`
- Modify: `store/store.css`
- Test: `tests/product.test.mjs`

- [ ] Test localized product lookup and invalid product behavior.
- [ ] Add product detail renderer and quantity controls.
- [ ] Add animated cart drawer, empty state and persistent cart.
- [ ] Verify desktop/mobile behavior.

### Task 3: Supabase Commerce Schema
**Files:**
- Create: `supabase/commerce-schema.sql`
- Create: `supabase/commerce-rls.sql`
- Test: SQL verification queries documented in `supabase/commerce-verification.sql`.

- [ ] Add products, categories, variants, carts, cart_items, orders, order_items, payments and store_settings.
- [ ] Add RLS policies for public catalog, authenticated customers and admins.
- [ ] Add indexes and constraints.
- [ ] Verify permissions and totals.

### Task 4: Checkout + Orders
**Files:**
- Create: `store/checkout.html`
- Create: `ar/store/checkout.html`
- Create: `store/checkout.js`
- Test: `tests/checkout.test.mjs`

- [ ] Test trusted total calculation and payload validation.
- [ ] Build bilingual checkout UI.
- [ ] Persist order draft to Supabase.
- [ ] Keep payment secrets server-side via Edge Function.

### Task 5: Admin Commerce Integration
**Files:**
- Create: `admin/store-products.html`
- Create: `admin/store-orders.html`
- Modify: `admin/dashboard.html`
- Test: admin access verification checklist.

- [ ] Add product management.
- [ ] Add order management and fulfillment statuses.
- [ ] Add commerce KPIs to dashboard.
- [ ] Enforce admin role checks.
