# Alameen LiveAvatar token function

This function keeps the HeyGen API key on Supabase and returns only a short-lived LiveAvatar session token to the A Solution website.

## Required secrets

Set these in the Supabase project; never put their values in GitHub:

```bash
supabase secrets set \
  HEYGEN_API_KEY="<server-only-key>" \
  LIVEAVATAR_AVATAR_ID="<custom-avatar-id>" \
  LIVEAVATAR_CONTEXT_ID="<avatar-persona-context-id>" \
  LIVEAVATAR_LANGUAGE="ar-SA" \
  LIVEAVATAR_SANDBOX="true" \
  ALAMEEN_ALLOWED_ORIGIN="https://alameensolution.site"
```

`LIVEAVATAR_CONTEXT_ID` can be omitted only when the provider configuration does not require a persona context. Use `LIVEAVATAR_SANDBOX="false"` for production after the session is tested.

## Deploy

```bash
supabase functions deploy alameen-liveavatar-token
```

The public website sends the Supabase publishable key in the `apikey` header.
This function opts out of the platform's default JWT check in
`supabase/config.toml`, then validates the publishable key in the handler with
Supabase's official server context. The publishable key is safe to expose in
browser code; never expose `HEYGEN_API_KEY`.

The frontend calls:

```text
https://<project-ref>.supabase.co/functions/v1/alameen-liveavatar-token
```

The function accepts `POST` and `OPTIONS` only, checks the `Origin` header, and never returns `HEYGEN_API_KEY`.
It also applies a best-effort limit of six token requests per minute per edge client to reduce accidental session bursts.
