'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

//로그인이 안 되었을 경우 리디렉트용 wrapper
const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const user = {};

  useEffect(() => {
    if (!user && pathname !== '/') {
      router.push('/');
    }
  }, [user, pathname]);

  return <>{children}</>;
};
export default AuthWrapper;
