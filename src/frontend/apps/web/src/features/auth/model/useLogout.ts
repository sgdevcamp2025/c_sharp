'use client';
import { useRouter } from 'next/navigation';

import { useUserStore } from '@/src/shared';

export const useLogout = () => {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  return () => {
    localStorage.removeItem('user');
    localStorage.removeItem('chat');
    setUser(null);
    document.cookie =
      'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie =
      'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/');
  };
};
