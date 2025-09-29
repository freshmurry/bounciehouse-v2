// Minimal local replacement for Base44 client used by the app.
// This provides a lightweight proxy that forwards calls to /api/* endpoints
// so the frontend can run without the @base44/sdk. Implement server endpoints
// on your Cloudflare Worker to handle these requests.

function makeProxy(pathBase) {
  return new Proxy({}, {
    get(_, method) {
      return async (params) => {
        const headers = { 'Content-Type': 'application/json' };
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            const t = window.localStorage.getItem('access_token');
            if (t) headers['Authorization'] = `Bearer ${t}`;
          } catch (e) {}
        }
        const res = await fetch(`/api/${pathBase}/${String(method)}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(params === undefined ? {} : params)
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API ${pathBase}.${String(method)} failed: ${res.status} ${text}`);
        }
        // try parse json, otherwise return text
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) return res.json();
        return res.text();
      };
    }
  });
}

const base44 = {
  entities: new Proxy({}, {
    get(_, entityName) {
      return makeProxy(`entities/${String(entityName)}`);
    }
  }),
  functions: makeProxy('functions'),
  integrations: {
    Core: makeProxy('integrations/core')
  },
  auth: {
    me: async () => {
      const headers = {};
      if (typeof window !== 'undefined' && window.localStorage) {
        try { const t = window.localStorage.getItem('access_token'); if (t) headers['Authorization'] = `Bearer ${t}`; } catch (e) {}
      }
      const res = await fetch('/api/auth/me', { headers });
      if (!res.ok) return null;
      return res.json();
    },
    login: async (credentials) => {
      // credentials: { email, password }
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials || {})
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Login failed: ${res.status} ${txt}`);
      }
      const data = await res.json();
      if (data?.token && typeof window !== 'undefined' && window.localStorage) {
        try { window.localStorage.setItem('access_token', data.token); } catch (e) {}
      }
      return data;
    },
    logout: (redirectUrl) => {
      if (typeof window !== 'undefined' && window.localStorage) {
        try { window.localStorage.removeItem('access_token'); } catch (e) {}
      }
      if (redirectUrl && typeof window !== 'undefined') window.location.href = redirectUrl;
    },
    setToken: (token, save = true) => {
      if (typeof window !== 'undefined' && window.localStorage && token && save) {
        try { window.localStorage.setItem('access_token', token); } catch (e) {}
      }
    }
  }
};

export { base44 };
export default base44;
