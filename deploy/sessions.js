// Minimal Durable Object class for session storage
export class Sessions {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  // Simple fetch handler to demonstrate storing JSON session data
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/session') {
      const data = await request.json().catch(() => ({}));
      await this.state.storage.put('data', data);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (request.method === 'GET' && url.pathname === '/session') {
      const data = await this.state.storage.get('data');
      return new Response(JSON.stringify(data || null), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response('Not Found', { status: 404 });
  }
}
