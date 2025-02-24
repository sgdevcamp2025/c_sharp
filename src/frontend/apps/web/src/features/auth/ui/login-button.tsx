'use client';

import { Button } from '@workspace/ui/components';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const LoginButton = () => {
  const router = useRouter();

  const handleKakaoLogin = () => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI}&response_type=code`;

    router.push(kakaoAuthUrl);
  };
  return (
    <Button
      onClick={handleKakaoLogin}
      variant="ghost"
      className="p-0 border-none bg-transparent w-auto h-auto"
    >
      <Image
        src="/images/kakao-login-large-narrow.png"
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
