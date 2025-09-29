// Minimal local replacement for Base44 client used by the app.
// This provides a lightweight proxy that forwards calls to /api/* endpoints
// so the frontend can run without the @base44/sdk. Implement server endpoints
// on your Cloudflare Worker to handle these requests.

function makeProxy(pathBase) {
  return new Proxy({}, {
    get(_, method) {
      return async (params) => {
        const headers = { 'Content-Type': 'application/json' };
        // attach access token if present
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            const t = window.localStorage.getItem('access_token');
            if (t) headers['Authorization'] = `Bearer ${t}`;
          } catch (e) {}
        }

        // helper to perform request and handle 401 -> try refresh once
        const doRequest = async (attemptRefresh = true) => {
          const res = await fetch(`/api/${pathBase}/${String(method)}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(params === undefined ? {} : params)
          });
          if (res.status === 401 && attemptRefresh) {
            // try refresh
            const refreshed = await tryRefreshToken();
            if (refreshed) {
              // update header and retry
              const rt = window.localStorage.getItem('access_token');
              if (rt) headers['Authorization'] = `Bearer ${rt}`;
              return doRequest(false);
            }
          }
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`API ${pathBase}.${String(method)} failed: ${res.status} ${text}`);
          }
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) return res.json();
          return res.text();
        };

        return doRequest(true);
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
      // expected: { access_token, refresh_token, expires_in }
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          if (data.access_token) window.localStorage.setItem('access_token', data.access_token);
          if (data.refresh_token) window.localStorage.setItem('refresh_token', data.refresh_token);
        } catch (e) {}
      }
      return data;
    },
    logout: (redirectUrl) => {
      if (typeof window !== 'undefined' && window.localStorage) {
        try { window.localStorage.removeItem('access_token'); } catch (e) {}
        try { window.localStorage.removeItem('refresh_token'); } catch (e) {}
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

async function tryRefreshToken() {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  const refresh = window.localStorage.getItem('refresh_token');
  if (!refresh) return false;
  try {
    const res = await fetch('/api/auth/refresh', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: refresh }) });
    if (!res.ok) return false;
    const data = await res.json();
    if (data?.access_token) {
      window.localStorage.setItem('access_token', data.access_token);
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

export { base44 };
export default base44;
