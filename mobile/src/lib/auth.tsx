import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { auth as api, type User } from './api';

type Status = 'loading' | 'signed-in' | 'signed-out';

type AuthValue = {
  status: Status;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let active = true;
    api.restore().then((restored) => {
      if (!active) return;
      setUser(restored);
      setStatus(restored ? 'signed-in' : 'signed-out');
    });
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const signedIn = await api.signIn(email, password);
    setUser(signedIn);
    setStatus('signed-in');
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const created = await api.signUp(name, email, password);
    setUser(created);
    setStatus('signed-in');
  }, []);

  const signOut = useCallback(async () => {
    await api.signOut();
    setUser(null);
    setStatus('signed-out');
  }, []);

  const value = useMemo(() => ({ status, user, signIn, signUp, signOut }), [status, user, signIn, signUp, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
