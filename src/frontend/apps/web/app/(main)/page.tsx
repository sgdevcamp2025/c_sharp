import { LoginButton } from '@/src/features/auth';

export const metadata = {
  title: '주톡피아 - 카카오 로그인',
  description:
    '주톡피아에서 카카오 로그인을 통해 간편하게 시작하세요. 실시간 주식 정보와 협업 기능을 한곳에서 제공하여, 투자와 소통',
  openGraph: {
    title: '주톡피아',
    description:
      '주톡피아에서 카카오 로그인을 통해 간편하게 시작하세요. 실시간 주식 정보와 협업 기능을 한곳에서 제공하여, 투자와 소통',
    url: '',
    siteName: '주톡피아',
    images: [
      {
        url: '',
        width: 1200,
        height: 630,
        alt: '주톡피아',
      },
    ],
    type: 'website',
  },
};

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-svh">
      <h1 className="text-3xl text-primary font-bold">주톡피아</h1>
      <LoginButton />
    </div>
  );
}
