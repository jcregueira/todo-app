import { useCallback } from 'react';
import { authApi } from '@/api/client';
import { useAuthStore } from '@/store/authStore';

export default function useAuth() {
  const token = useAuthStore((s) => s.token);
  const setTokens = useAuthStore((s) => s.setTokens);
  const clearTokens = useAuthStore((s) => s.clearTokens);

  const isAuthenticated = !!token;

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password);
      setTokens(res.data.access_token, res.data.refresh_token);
    },
    [setTokens]
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.register(email, password);
      setTokens(res.data.access_token, res.data.refresh_token);
    },
    [setTokens]
  );

  const logout = useCallback(() => {
    clearTokens();
  }, [clearTokens]);

  return {
    isAuthenticated,
    login,
    register,
    logout,
  };
}
