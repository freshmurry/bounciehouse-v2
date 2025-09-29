import React, { createContext, useContext, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext({ user: null, loading: true, login: async () => {}, logout: () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await base44.auth.me();
        if (mounted) setUser(me);
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const login = async (credentials) => {
    const data = await base44.auth.login(credentials);
    // data.user expected
    setUser(data.user || null);
    return data;
  };

  const logout = (redirect) => {
    base44.auth.logout(redirect);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;
