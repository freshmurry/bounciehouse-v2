// Module-style Cloudflare Worker with bindings for R2, D1/D2, Durable Objects and JWT auth skeleton.
// This file acts as a starting point — replace the mocked logic with production-grade implementations.

// Use Web Crypto (global `crypto.subtle`) for HMAC signing/verification in Cloudflare Workers

/**
 * Expected bindings on the `env` param:
 * - ASSETS_R2: R2 bucket binding
 * - DB: D1/D2 binding name
 * - SESSIONS_DO: Durable Object binding
 * - JWT_SECRET: string (via wrangler vars or secrets)
 */

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);

      // Serve API routes under /api
      if (url.pathname.startsWith('/api/')) {
        return await handleApi(request, env, ctx);
      }

      // Fallback: try to serve static assets from R2 or the Workers Site
      // If you use `wrangler publish` with `site`, Cloudflare will serve assets automatically.
      return new Response('Not Found', { status: 404 });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }
};

async function handleApi(request, env, ctx) {
  const url = new URL(request.url);
  // Simple router
  if (url.pathname.startsWith('/api/functions/')) {
    const fn = url.pathname.replace('/api/functions/', '');
    return json({ ok: true, function: fn, args: await readJson(request) });
  }

  if (url.pathname === '/api/auth/login') {
    const body = await readJson(request) || {};
    const { email, password } = body;
    // TODO: validate against DB and hashed password (argon2). For now accept non-empty credentials.
    if (email && password) {
      // create access token (short lived) and refresh token stored in Durable Object
      const accessExp = Math.floor(Date.now() / 1000) + (15 * 60); // 15 minutes
      const accessToken = await signJWT({ sub: email }, env.JWT_SECRET || 'dev-secret', accessExp);

      // create refresh token (random) and store in Sessions DO with longer expiry
      const refreshToken = generateRandomToken();
      const refreshExp = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days
      // store in Sessions DO
      if (env.SESSIONS_DO) {
        const id = env.SESSIONS_DO.idFromName('sessions');
        const stub = env.SESSIONS_DO.get(id);
        await stub.fetch(new Request('https://sessions/session/' + refreshToken, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, expiresAt: refreshExp })
        }));
      }

      return json({ access_token: accessToken, token_type: 'Bearer', expires_in: 15 * 60, refresh_token: refreshToken, user: { email, name: 'User' } });
    }
    return new Response('Invalid credentials', { status: 401 });
  }

  if (url.pathname === '/api/auth/refresh') {
    // body: { refresh_token }
    const body = await readJson(request) || {};
    const { refresh_token } = body;
    if (!refresh_token) return new Response('Missing refresh_token', { status: 400 });
    if (!env.SESSIONS_DO) return new Response('Sessions DO not configured', { status: 500 });
    const id = env.SESSIONS_DO.idFromName('sessions');
    const stub = env.SESSIONS_DO.get(id);
    const res = await stub.fetch(new Request('https://sessions/session/' + refresh_token));
    if (!res.ok) return new Response('Invalid refresh token', { status: 401 });
    const data = await res.json().catch(() => null);
    if (!data || !data.email || Date.now() > (data.expiresAt || 0)) return new Response('Refresh token expired', { status: 401 });
    // issue new access token
    const accessExp = Math.floor(Date.now() / 1000) + (15 * 60);
    const accessToken = await signJWT({ sub: data.email }, env.JWT_SECRET || 'dev-secret', accessExp);
    return json({ access_token: accessToken, token_type: 'Bearer', expires_in: 15 * 60 });
  }

  if (url.pathname === '/api/auth/me') {
    const auth = request.headers.get('Authorization') || '';
    if (!auth) return json(null);
    const token = auth.replace('Bearer ', '');
    const payload = await verifyJWT(token, env.JWT_SECRET || 'dev-secret');
    if (!payload) return new Response('Invalid token', { status: 401 });
    return json({ email: payload.sub, name: payload.name || 'User' });
  }

  if (url.pathname.startsWith('/api/entities/')) {
    const rest = url.pathname.replace('/api/entities/', '');
    return json({ ok: true, entityRoute: rest, body: await readJson(request) });
  }

  return new Response('Not Found', { status: 404 });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch (e) {
    return null;
  }
}

// Minimal token utilities (replace with real JWT library or Cloudflare Access)
function signToken(payload, secret) {
  // Very small HMAC 'token' for demo purposes: base64(payload)|sig
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifyToken(token, secret) {
  try {
    const [data, sig] = token.split('.');
    if (!data || !sig) return null;
    const expected = createHmac('sha256', secret).update(data).digest('base64url');
    if (expected !== sig) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    return payload;
  } catch (e) {
    return null;
  }
}

// --- New: Web Crypto based JWT helpers (HS256-like) ---
async function importSecretKey(secret) {
  const enc = new TextEncoder().encode(secret);
  return await crypto.subtle.importKey('raw', enc, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

function base64url(buf) {
  // buf is ArrayBuffer or string
  let b64;
  if (typeof buf === 'string') b64 = btoa(buf);
  else b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
  return b64.replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function signJWT(payload, secret, exp) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = { ...payload, exp };
  const data = base64url(JSON.stringify(header)) + '.' + base64url(JSON.stringify(body));
  const key = await importSecretKey(secret);
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return data + '.' + base64url(sigBuf);
}

async function verifyJWT(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, bodyB64, sigB64] = parts;
    const data = headerB64 + '.' + bodyB64;
    const key = await importSecretKey(secret);
    const sigBuf = Uint8Array.from(atob(sigB64.replace(/-/g, '+').replace(/_/g, '/')).split('').map(c => c.charCodeAt(0)));
    const ok = await crypto.subtle.verify('HMAC', key, sigBuf, new TextEncoder().encode(data));
    if (!ok) return null;
    const bodyJson = JSON.parse(decodeURIComponent(escape(atob(bodyB64.replace(/-/g, '+').replace(/_/g, '/')))));
    if (bodyJson.exp && Math.floor(Date.now() / 1000) > bodyJson.exp) return null;
    return bodyJson;
  } catch (e) {
    return null;
  }
}

function generateRandomToken() {
  // 32-byte random token hex
  const arr = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}
