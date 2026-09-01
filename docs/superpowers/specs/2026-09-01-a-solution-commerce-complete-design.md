# A Solution Commerce Complete Design

A reusable white-label commerce core for isolated per-client Supabase deployments. It supports physical, digital and service products in one mixed cart/order; provider-neutral Saudi payments (including Mada/cards/Apple Pay when the selected gateway supports them), bank transfer, invoice/manual payment and configurable COD; API/manual shipping and pickup; customer portal; CRM; service jobs; protected digital fulfillment; RBAC; automations; reports; auditability and white-label settings.

The Storefront, Commerce Admin, Supabase backend and provider adapters are separate boundaries. Sensitive provider keys are server-side only. RLS is required. Order price, discounts, VAT, shipping, inventory and payment state are server-authoritative. Order commits are atomic at the database layer. Each client/store gets its own Supabase project/database and secrets.

This delivery is additive to the existing `commerce_*` production schema and does not use production resets.
