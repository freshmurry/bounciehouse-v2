// Module-style Cloudflare Worker with bindings for R2, D1/D2, Durable Objects and JWT auth skeleton.
// This file acts as a starting point — replace the mocked logic with production-grade implementations.

import { createHmac } from 'crypto';

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
    if (email && password) {
      // In production, verify password via D1/D2 and hash; here we create a signed JWT-like token for demo
      const token = signToken({ sub: email }, env.JWT_SECRET || 'dev-secret');
      return json({ token, user: { email, name: 'User' } });
    }
    return new Response('Invalid credentials', { status: 401 });
  }

  if (url.pathname === '/api/auth/me') {
    const auth = request.headers.get('Authorization') || '';
    if (!auth) return json(null);
    const token = auth.replace('Bearer ', '');
    const payload = verifyToken(token, env.JWT_SECRET || 'dev-secret');
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
