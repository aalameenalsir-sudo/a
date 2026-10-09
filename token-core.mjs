const LIVEAVATAR_TOKEN_URL = 'https://api.liveavatar.com/v1/sessions/token';
const DEFAULT_RATE_LIMIT = 6;
const DEFAULT_RATE_WINDOW_MS = 60_000;

export function buildLiveAvatarTokenRequest(env) {
  const settings = env || {};
  const apiKey = String(settings.HEYGEN_API_KEY || '').trim();
  const avatarId = String(settings.LIVEAVATAR_AVATAR_ID || '').trim();
  if (!apiKey) throw new Error('HEYGEN_API_KEY is required');
  if (!avatarId) throw new Error('LIVEAVATAR_AVATAR_ID is required');

  const persona = {
    language: String(settings.LIVEAVATAR_LANGUAGE || 'ar-SA'),
  };
  const contextId = String(settings.LIVEAVATAR_CONTEXT_ID || '').trim();
  if (contextId) persona.context_id = contextId;

  return {
    url: LIVEAVATAR_TOKEN_URL,
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: {
      mode: 'FULL',
      interactivity_type: 'CONVERSATIONAL',
      avatar_id: avatarId,
      is_sandbox: String(settings.LIVEAVATAR_SANDBOX || '').toLowerCase() === 'true',
      avatar_persona: persona,
    },
  };
}

export function isAllowedLiveAvatarOrigin(origin, allowedOrigin) {
  const requestOrigin = String(origin || '').trim();
  const configuredOrigin = String(allowedOrigin || '').trim();
  if (!requestOrigin) return false;
  return Boolean(configuredOrigin && requestOrigin === configuredOrigin);
}

export function readLiveAvatarSessionToken(payload) {
  const token = payload && payload.data && payload.data.session_token;
  if (!token || typeof token !== 'string') throw new Error('session token was not returned');
  return token;
}

export function publicLiveAvatarTokenPayload(sessionToken) {
  if (!sessionToken || typeof sessionToken !== 'string') throw new Error('session token is required');
  return { session_token: sessionToken };
}

export function getLiveAvatarClientKey(headers) {
  const values = [
    headers && headers.get && headers.get('cf-connecting-ip'),
    headers && headers.get && headers.get('x-real-ip'),
    headers && headers.get && headers.get('x-forwarded-for'),
  ];
  for (const value of values) {
    const first = String(value || '').split(',')[0].trim();
    if (first) return first;
  }
  return '';
}

export function isLiveAvatarRateLimited(
  history,
  clientKey,
  now = Date.now(),
  limit = DEFAULT_RATE_LIMIT,
  windowMs = DEFAULT_RATE_WINDOW_MS,
) {
  if (!(history instanceof Map) || !clientKey) return false;
  const active = (history.get(clientKey) || []).filter((timestamp) => now - timestamp < windowMs);
  if (active.length >= limit) {
    history.set(clientKey, active);
    return true;
  }
  active.push(now);
  history.set(clientKey, active);
  return false;
}
