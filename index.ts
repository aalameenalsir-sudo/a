import { createSupabaseContext } from 'npm:@supabase/server@1';

import {
  buildLiveAvatarTokenRequest,
  getLiveAvatarClientKey,
  isAllowedLiveAvatarOrigin,
  isLiveAvatarRateLimited,
  publicLiveAvatarTokenPayload,
  readLiveAvatarSessionToken,
} from './token-core.mjs';

const defaultOrigin = 'https://alameensolution.site';
const tokenRequestHistory = new Map<string, number[]>();

function corsHeaders(origin: string, allowedOrigin: string): Record<string, string> {
  const allowOrigin = origin && origin === allowedOrigin ? origin : allowedOrigin;
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
    'Vary': 'Origin',
  };
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  origin: string,
  allowedOrigin: string,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin, allowedOrigin), ...extraHeaders },
  });
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('origin') || '';
  const allowedOrigin = Deno.env.get('ALAMEEN_ALLOWED_ORIGIN') || defaultOrigin;

  if (!isAllowedLiveAvatarOrigin(origin, allowedOrigin)) {
    return jsonResponse({ error: 'origin is not allowed' }, 403, origin, allowedOrigin);
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin, allowedOrigin) });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'method not allowed' }, 405, origin, allowedOrigin);
  }

  const { error: authError } = await createSupabaseContext(request, { auth: 'publishable' });
  if (authError) {
    return jsonResponse({ error: 'publishable key is not authorized' }, 401, origin, allowedOrigin);
  }

  const clientKey = getLiveAvatarClientKey(request.headers);
  if (isLiveAvatarRateLimited(tokenRequestHistory, clientKey)) {
    return jsonResponse(
      { error: 'too many LiveAvatar sessions requested; try again shortly' },
      429,
      origin,
      allowedOrigin,
      { 'Retry-After': '60' },
    );
  }

  try {
    const upstreamRequest = buildLiveAvatarTokenRequest({
      HEYGEN_API_KEY: Deno.env.get('HEYGEN_API_KEY'),
      LIVEAVATAR_AVATAR_ID: Deno.env.get('LIVEAVATAR_AVATAR_ID'),
      LIVEAVATAR_CONTEXT_ID: Deno.env.get('LIVEAVATAR_CONTEXT_ID'),
      LIVEAVATAR_LANGUAGE: Deno.env.get('LIVEAVATAR_LANGUAGE'),
      LIVEAVATAR_SANDBOX: Deno.env.get('LIVEAVATAR_SANDBOX'),
    });

    const upstream = await fetch(upstreamRequest.url, {
      method: 'POST',
      headers: upstreamRequest.headers,
      body: JSON.stringify(upstreamRequest.body),
    });

    if (!upstream.ok) {
      return jsonResponse({ error: 'LiveAvatar token service rejected the request' }, 502, origin, allowedOrigin);
    }

    const payload = await upstream.json();
    const sessionToken = readLiveAvatarSessionToken(payload);
    return jsonResponse(publicLiveAvatarTokenPayload(sessionToken), 200, origin, allowedOrigin);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'LiveAvatar setup is incomplete';
    const safeMessage = /required|not returned/.test(message) ? message : 'LiveAvatar setup is incomplete';
    return jsonResponse({ error: safeMessage }, 500, origin, allowedOrigin);
  }
});
