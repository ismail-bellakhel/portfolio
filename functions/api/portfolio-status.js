const VISIT_COUNT_KEY = 'portfolio:visits';
const LAST_SEEN_KEY = 'portfolio:last-seen';
const SESSION_COOKIE = 'portfolio_visitor';
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
  const cookies = request.headers.get('Cookie') || '';
  return cookies.split(';').some(cookie => cookie.trim().startsWith(`${SESSION_COOKIE}=`));
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
      if (!env.PORTFOLIO_PRESENCE_KEY || request.headers.get('x-presence-key') !== env.PORTFOLIO_PRESENCE_KEY) {
        return json({ error: 'Unauthorized' }, 401);
      }

      const lastSeen = Date.now();
      await redis(env, 'SET', LAST_SEEN_KEY, lastSeen);
      return json({ online: true, lastSeen });
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
    }, 200, headers);
  } catch (error) {
    console.error('Portfolio status error:', error);
    return json({ error: 'Portfolio status is temporarily unavailable.' }, 503);
  }
}
