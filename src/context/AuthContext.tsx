import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Language } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (profile: { email: string; name?: string; avatar?: string }) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, pass: string, lang?: Language) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: { username?: string; language?: Language; password?: string }) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  getAuthHeader: () => Record<string, string>;
  connectDiscord: () => Promise<void>;
  disconnectDiscord: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('trl_cloud_token'));
  const [loading, setLoading] = useState<boolean>(true);

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

    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && origin !== window.location.origin) {
        return;
      }
      if (event.data?.type === 'DISCORD_AUTH_SUCCESS') {
        if (event.data.token) {
          localStorage.setItem('trl_cloud_token', event.data.token);
          setToken(event.data.token);
        }
        if (event.data.user) {
          setUser(event.data.user);
        }
        refreshUser();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const connectDiscord = async () => {
    try {
      const currentToken = token || localStorage.getItem('trl_cloud_token');
      const redirectUri = `${window.location.origin}/api/auth/discord/callback`;
      const res = await fetch(`/api/auth/discord/url?redirect_uri=${encodeURIComponent(redirectUri)}${currentToken ? '&state=' + encodeURIComponent(currentToken) : ''}`);
      
      if (!res.ok) {
        throw new Error('Failed to get Discord authorization URL');
      }

      const { url } = await res.json();
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;

      const popup = window.open(
        url,
        'discord_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes`
      );

      if (!popup) {
        alert('Please allow popups to connect your Discord account.');
      }
    } catch (err) {
      console.error('Discord Auth Error:', err);
    }
  };

  const disconnectDiscord = async () => {
    try {
      const res = await fetch('/api/auth/discord/disconnect', {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return { success: true };
      } else {
        const err = await res.json();
        return { success: false, error: err.error || 'Failed to disconnect Discord account' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Error disconnecting Discord' };
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      localStorage.setItem('trl_cloud_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login' };
    }
  };

  const loginWithGoogle = async (profile: { email: string; name?: string; avatar?: string }) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Google Sign-In failed' };
      }

      localStorage.setItem('trl_cloud_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during Google Sign-In' };
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

  const logout = () => {
    localStorage.removeItem('trl_cloud_token');
    setToken(null);
    setUser(null);
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
      login,
      loginWithGoogle,
      register,
      logout,
      updateProfile,
      refreshUser,
      getAuthHeader,
      connectDiscord,
      disconnectDiscord
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
