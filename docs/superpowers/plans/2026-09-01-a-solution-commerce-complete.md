# A Solution Commerce Complete Implementation Plan

**Goal:** Finish the existing commerce system as a reusable white-label platform without replacing the approved storefront visual design.

**Architecture:** Additive PostgreSQL migration + Supabase Edge Functions + static storefront/admin enhancements. The database owns consistency and RLS; Edge Functions own secrets/provider calls; browser code uses only publishable credentials.

**Tech Stack:** Static HTML/CSS/JavaScript, Supabase PostgreSQL/Auth/Storage/Edge Functions, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-09-01-a-solution-commerce-complete-design.md`

## Global Constraints
- No production database reset.
- No service-role or payment secret in browser files.
- Physical, digital and service products work from the same catalog/cart.
- Guest checkout and authenticated customer portal both remain available.
- Existing A Solution visual language is preserved.
- Provider integrations are replaceable adapters configured by server secrets.

## Delivery Tasks
1. Extend commerce schema, RBAC, white-label settings and private storage.
2. Make order commit atomic and support mixed fulfillment.
3. Add payment initialization, signed webhook verification and refunds.
4. Add secure digital delivery and service-job workflows.
5. Make storefront catalog/cart/checkout dynamic and variant-aware.
6. Expand customer portal and CRM 360°.
7. Add product CRUD, categories, variants, settings, roles, order detail, digital delivery, service jobs and automation administration.
8. Add reporting/export and quality verification.
9. Apply migration and deploy Edge Functions only after final verification.
10. Push the complete repository update to GitHub once.
