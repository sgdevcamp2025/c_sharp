'use client';

import { requestLogin } from '@/src/features/auth/api/requestLogin.api';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function RedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  useEffect(() => {
    if (!code) {
      alert('인가 코드가 없습니다. 다시 로그인 해주세요.');
      router.replace('/');
      return;
    }

    const fetchLogin = async () => {
      try {
        await requestLogin(code);
        router.replace('/stock');
      } catch (err) {
        console.error('로그인 실패:', err);
        alert('로그인에 실패했습니다. 다시 로그인 해주세요.');
        router.replace('/');
      }
    };

    fetchLogin();
  }, [code]);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
