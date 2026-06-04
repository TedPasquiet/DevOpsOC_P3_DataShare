import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiFetch } from '../lib/api';

export interface AuthUser {
  id: number;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jwt'));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('jwt'));

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    apiFetch('/users/me')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then((data: AuthUser) => setUser(data))
      .catch(() => {
        localStorage.removeItem('jwt');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function login(email: string, password: string): Promise<void> {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      throw new Error(
        res.status === 401 ? 'Email ou mot de passe incorrect.' : 'Connexion impossible, veuillez réessayer.'
      );
    }
    const { token: jwt } = await res.json() as { token: string };
    localStorage.setItem('jwt', jwt);
    setToken(jwt);
  }

  async function register(email: string, password: string): Promise<void> {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const messages: Record<number, string> = {
        409: 'Cette adresse email est déjà utilisée.',
        422: 'Email invalide ou mot de passe trop court (8 caractères minimum).',
      };
      throw new Error(messages[res.status] ?? "Inscription impossible, veuillez réessayer.");
    }
    await login(email, password);
  }

  function logout(): void {
    localStorage.removeItem('jwt');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
