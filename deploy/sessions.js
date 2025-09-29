// Minimal Durable Object class for session storage
export class Sessions {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  // Simple fetch handler to demonstrate storing JSON session data
  async fetch(request) {
    const url = new URL(request.url);
    // POST /session/<token>  -> store data for token
    if (request.method === 'POST' && url.pathname.startsWith('/session/')) {
      const token = url.pathname.replace('/session/', '');
      const data = await request.json().catch(() => ({}));
      await this.state.storage.put(token, data);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // GET /session/<token> -> retrieve data
    if (request.method === 'GET' && url.pathname.startsWith('/session/')) {
      const token = url.pathname.replace('/session/', '');
      const data = await this.state.storage.get(token);
      return new Response(JSON.stringify(data || null), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response('Not Found', { status: 404 });
  }
}
