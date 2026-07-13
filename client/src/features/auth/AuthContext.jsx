import React, { createContext, useState, useCallback } from 'react';
import { loginRequest, registerRequest } from './authApi.js';

export const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem('gharbaar_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('gharbaar_token'));

  const persist = useCallback((nextUser, nextToken) => {
    localStorage.setItem('gharbaar_user', JSON.stringify(nextUser));
    localStorage.setItem('gharbaar_token', nextToken);
    setUser(nextUser);
    setToken(nextToken);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const data = await loginRequest(credentials);
      persist(data.user, data.token);
      return data.user;
    },
    [persist]
  );

  const register = useCallback(
    async (payload) => {
      const data = await registerRequest(payload);
      persist(data.user, data.token);
      return data.user;
    },
    [persist]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('gharbaar_user');
    localStorage.removeItem('gharbaar_token');
    setUser(null);
    setToken(null);
  }, []);

  const updateSession = useCallback(
    (nextUser, nextToken) => {
      persist(nextUser, nextToken);
    },
    [persist]
  );

  const value = { user, token, isAuthenticated: Boolean(token), login, register, logout, updateSession };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
