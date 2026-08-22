'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { insforge } from '@/lib/insforge';

type User = { id: string; email?: string; [key: string]: any } | null;

interface AuthContextType {
  user: User;
  loading: boolean;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGithub: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    insforge.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = insforge.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGithub = async () => {
    await insforge.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin,
        scopes: 'read:user user:email',
      },
    });
  };

  const signOut = async () => {
    await insforge.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGithub, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
