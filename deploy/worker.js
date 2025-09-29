// Simple Cloudflare Worker template to host placeholder /api/* endpoints.
// Replace handlers with real implementations (Stripe webhooks, auth, entities, etc.)

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/functions/')) {
    const fn = url.pathname.replace('/api/functions/', '');
    return new Response(JSON.stringify({ ok: true, function: fn, args: await readJson(request) }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  if (url.pathname === '/api/auth/me') {
    // Return a mocked user if Authorization header is present
    const auth = request.headers.get('Authorization') || '';
    if (!auth) return new Response(JSON.stringify(null), { status: 200, headers: { 'Content-Type': 'application/json' } });
    // very simple token parsing for dev: token is 'devtoken:user@example.com'
    const parts = auth.replace('Bearer ', '').split(':');
    const email = parts[1] || 'dev@example.com';
    return new Response(JSON.stringify({ email, name: 'Dev User' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  if (url.pathname === '/api/auth/login') {
    const body = await readJson(request) || {};
    const { email, password } = body;
    // Very simple dev auth: accept any non-empty email/password
    if (email && password) {
      const token = `devtoken:${email}`;
      return new Response(JSON.stringify({ token, user: { email, name: 'Dev User' } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response('Invalid credentials', { status: 401 });
  }

  if (url.pathname.startsWith('/api/entities/')) {
    // Minimal echo for entity calls: route is /api/entities/EntityName/method
    const rest = url.pathname.replace('/api/entities/', '');
    return new Response(JSON.stringify({ ok: true, entityRoute: rest, body: await readJson(request) }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response('Not Found', { status: 404 });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch (e) {
    return null;
  }
}
