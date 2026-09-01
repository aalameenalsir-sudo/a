# A Solution Commerce Final Deployment

## Files in this overlay
Copy the contents of this folder into the repository root, preserving paths. Existing files with the same path are intentional replacements; new files are additions.

## Supabase deployment order
1. The six commerce migrations in this package are named to match the exact migration versions already recorded in production Supabase. Do not re-apply them and do not run `db reset` on production. For a fresh client Supabase project, apply them in filename order.
2. Deploy these Edge Functions: `commerce-create-order` (public checkout, verify_jwt=false), `commerce-create-payment` (public-token protected, verify_jwt=false), `commerce-payment-webhook` (provider-signature protected, verify_jwt=false), `commerce-digital-download` (verify_jwt=true), `commerce-refund` (verify_jwt=true), `commerce-admin-upload` (verify_jwt=true), `commerce-process-automations` (cron-secret protected, verify_jwt=false).
3. Configure only the adapters actually used. Required online-payment secrets: `PAYMENT_CREATE_ENDPOINT`, `PAYMENT_SECRET_KEY`, `PAYMENT_WEBHOOK_URL`, `PAYMENT_RETURN_URL`, `PAYMENT_WEBHOOK_SECRET`. Automation adapters use `AUTOMATION_CRON_SECRET` plus the configured Email/SMS/WhatsApp endpoint/token pairs.
4. Online payment methods must stay disabled in `commerce_settings.enabled_payment_methods` until the merchant gateway is configured and sandbox-tested.
5. Run smoke tests with test orders before enabling live payment credentials.

## Important
Mada, Apple Pay, Visa/Mastercard and wallets are exposed through the selected Saudi payment gateway; the core intentionally does not hard-code one provider. Bank settlement configuration belongs to that merchant gateway and merchant bank account.
