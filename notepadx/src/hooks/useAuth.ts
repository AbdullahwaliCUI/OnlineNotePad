'use client';

import { useAuthContext } from '@/components/providers/AuthProvider';

export { type AuthState } from '@/components/providers/AuthProvider';

export function useAuth() {
  const context = useAuthContext();
  return {
    ...context,
    isAuthenticated: !!context.user
  };
}
