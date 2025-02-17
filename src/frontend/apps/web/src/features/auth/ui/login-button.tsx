'use client';

import { Button } from '@workspace/ui/components';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const LoginButton = () => {
  const router = useRouter();

  const handleKakaoLogin = () => {
    router.push('/stock');
  }; //kakao login 로직으로 변경 예정

  return (
    <Button
      onClick={handleKakaoLogin}
      variant="ghost"
      className="p-0 border-none bg-transparent w-auto h-auto"
    >
      <Image
        src="/images/kakao_login_large_narrow.png"
        alt="카카오 로그인"
        width={200}
        height={50}
        style={{ width: 'auto', height: 'auto' }}
        className="rounded-md"
      />
    </Button>
  );
};
export default LoginButton;
