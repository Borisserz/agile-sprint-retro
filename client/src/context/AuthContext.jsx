import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchProfile, getErrorMessage, login as loginRequest } from '../api';
import { disconnectSocket } from '../socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(() => (localStorage.getItem('token') ? 'loading' : 'anonymous'));
  const [bootError, setBootError] = useState(null);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setStatus('anonymous');
      return undefined;
    }

    let cancelled = false;
    setStatus('loading');
    fetchProfile()
      .then(({ data }) => {
        if (cancelled) return;
        setUser(data);
        setStatus('authenticated');
        setBootError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        localStorage.removeItem('token');
        disconnectSocket();
        setToken(null);
        setUser(null);
        setStatus('anonymous');
        setBootError(getErrorMessage(err));
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      status,
      bootError,
      async signIn(email, password) {
        const { data } = await loginRequest(email, password);
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setStatus('authenticated');
        setBootError(null);
        return data;
      },
      signOut() {
        localStorage.removeItem('token');
        disconnectSocket();
        setToken(null);
        setUser(null);
        setStatus('anonymous');
      },
      clearBootError() {
        setBootError(null);
      },
    }),
    [user, token, status, bootError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
