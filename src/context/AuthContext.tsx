import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Language } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  pendingEmail: string | null;
  demoCode: string | null;
  setPendingEmail: (email: string | null) => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; requireVerification?: boolean; email?: string; codeForDemo?: string; error?: string }>;
  register: (username: string, email: string, pass: string, lang?: Language) => Promise<{ success: boolean; requireVerification?: boolean; email?: string; codeForDemo?: string; error?: string }>;
  verifyEmail: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationCode: (email: string) => Promise<{ success: boolean; codeForDemo?: string; error?: string }>;
  logout: () => void;
  updateProfile: (data: { username?: string; language?: Language; password?: string }) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  getAuthHeader: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('trl_cloud_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [demoCode, setDemoCode] = useState<string | null>(null);

  const getAuthHeader = () => {
    const currentToken = token || localStorage.getItem('trl_cloud_token');
    return currentToken ? { Authorization: `Bearer ${currentToken}` } : {};
  };

  const refreshUser = async () => {
    const currentToken = token || localStorage.getItem('trl_cloud_token');
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('trl_cloud_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      const data = await res.json();

      if (data.requireVerification) {
        setPendingEmail(data.email || email);
        if (data.codeForDemo) setDemoCode(data.codeForDemo);
        return { success: false, requireVerification: true, email: data.email || email, codeForDemo: data.codeForDemo, error: data.error };
      }

      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      localStorage.setItem('trl_cloud_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setPendingEmail(null);
      setDemoCode(null);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login' };
    }
  };

  const register = async (username: string, email: string, pass: string, lang?: Language) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password: pass, language: lang })
      });

      const data = await res.json();

      if (data.requireVerification) {
        setPendingEmail(data.email || email);
        if (data.codeForDemo) setDemoCode(data.codeForDemo);
        return { success: true, requireVerification: true, email: data.email || email, codeForDemo: data.codeForDemo };
      }

      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      localStorage.setItem('trl_cloud_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during registration' };
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Verification failed' };
      }

      localStorage.setItem('trl_cloud_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setPendingEmail(null);
      setDemoCode(null);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error verifying email' };
    }
  };

  const resendVerificationCode = async (email: string) => {
    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to resend code' };
      }

      if (data.codeForDemo) setDemoCode(data.codeForDemo);
      return { success: true, codeForDemo: data.codeForDemo };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error resending code' };
    }
  };

  const logout = () => {
    localStorage.removeItem('trl_cloud_token');
    setToken(null);
    setUser(null);
    setPendingEmail(null);
    setDemoCode(null);
  };

  const updateProfile = async (data: { username?: string; language?: Language; password?: string }) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || 'Profile update failed' };
      }

      setUser(result.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error updating profile' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      pendingEmail,
      demoCode,
      setPendingEmail,
      login,
      register,
      verifyEmail,
      resendVerificationCode,
      logout,
      updateProfile,
      refreshUser,
      getAuthHeader
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
