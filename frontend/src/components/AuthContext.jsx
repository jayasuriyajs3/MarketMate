import { createContext, useContext, useEffect, useState } from 'react';
import { getProfile } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mm_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('mm_token');
    if (!token) {
      setLoading(false);
      return;
    }
    getProfile()
      .then((profile) => setUser(profile))
      .catch(() => {
        localStorage.removeItem('mm_token');
        localStorage.removeItem('mm_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = { user, setUser, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
