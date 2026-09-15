const VISIT_COUNT_KEY = 'portfolio:visits';
const LAST_SEEN_KEY = 'portfolio:last-seen';
const SESSION_COOKIE = 'portfolio_visitor';
const OWNER_COOKIE = 'portfolio_owner';
const ONLINE_WINDOW_MS = 5 * 60 * 1000;
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

async function redis(env, command, ...args) {
  const url = env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, '');
  const token = env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error('Upstash Redis REST environment variables are not configured.');
  }

  const path = [command, ...args].map(value => encodeURIComponent(String(value))).join('/');
  const response = await fetch(`${url}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error(`Redis request failed with ${response.status}.`);
  return (await response.json()).result;
}

function hasVisitorSession(request) {
  return Boolean(getCookie(request, SESSION_COOKIE));
}

function getCookie(request, name) {
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.split(';').map(cookie => cookie.trim()).find(cookie => cookie.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function normalizePresenceKey(value) {
  const trimmed = value?.trim() || '';
  const hasMatchingQuotes =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"));
  return hasMatchingQuotes ? trimmed.slice(1, -1).trim() : trimmed;
}

function json(body, status = 200, extraHeaders = {}) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store', ...extraHeaders },
  });
}

export async function onRequest({ request, env }) {
  try {
    if (request.method === 'POST') {
      const configuredKey = normalizePresenceKey(env.PORTFOLIO_PRESENCE_KEY);
      const suppliedKey = normalizePresenceKey(request.headers.get('x-presence-key'));
      let ownerToken = getCookie(request, OWNER_COOKIE);
      let ownerCookie;

      if (suppliedKey && configuredKey && suppliedKey === configuredKey) {
        ownerToken = crypto.randomUUID();
        await redis(env, 'SET', `portfolio:owner-session:${ownerToken}`, '1', 'EX', SESSION_MAX_AGE);
        ownerCookie = `${OWNER_COOKIE}=${ownerToken}; Max-Age=${SESSION_MAX_AGE}; Path=/; HttpOnly; SameSite=Strict; Secure`;
      } else if (!ownerToken || await redis(env, 'GET', `portfolio:owner-session:${ownerToken}`) !== '1') {
        return json({ error: 'Unauthorized' }, 401);
      }

      const lastSeen = Date.now();
      await redis(env, 'SET', LAST_SEEN_KEY, lastSeen);
      return json({ online: true, lastSeen }, 200, ownerCookie ? { 'Set-Cookie': ownerCookie } : {});
    }

    if (request.method !== 'GET') {
      return json({ error: 'Method not allowed' }, 405, { Allow: 'GET, POST' });
    }

    const isNewSession = !hasVisitorSession(request);
    const [visits, lastSeenValue] = await Promise.all([
      redis(env, isNewSession ? 'INCR' : 'GET', VISIT_COUNT_KEY),
      redis(env, 'GET', LAST_SEEN_KEY),
    ]);
    const lastSeen = Number(lastSeenValue) || null;
    const headers = isNewSession
      ? { 'Set-Cookie': `${SESSION_COOKIE}=${crypto.randomUUID()}; Max-Age=${SESSION_MAX_AGE}; Path=/; HttpOnly; SameSite=Lax; Secure` }
      : {};

    return json({
      visits: Number(visits) || 0,
      online: Boolean(lastSeen && Date.now() - lastSeen < ONLINE_WINDOW_MS),
      lastSeen,
      presenceConfigured: Boolean(normalizePresenceKey(env.PORTFOLIO_PRESENCE_KEY)),
    }, 200, headers);
  } catch (error) {
    console.error('Portfolio status error:', error);
    return json({ error: 'Portfolio status is temporarily unavailable.' }, 503);
  }
}
