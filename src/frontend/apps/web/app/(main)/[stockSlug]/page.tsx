import { ChatContainer } from '@/src/features/chat';
import { StockDetailLayout } from '@/src/features/stock';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

// 주식데이터를 가지고 올수있는 방법이 필요합니다.

export async function generateMetadata({ params }) {
  const { stockSlug } = params;

  return {
    title: `${stockSlug} - 주식 정보`,
    description: `${stockSlug}의 최신 주식 정보를 확인하세요.`,
    keywords: `주식, ${stockSlug}, 주식 정보`,
  };
}

export default function StockDetailsPage({ params }) {
  const { stockSlug } = params;
  // console.log(1, stockSlug);

  return (
    <div className="flex py-6 px-[30px] h-full min-w-0 min-h-0">
      <div className="pr-2 basis-[45%] flex flex-col min-w-0">
        <Link
          href={'/'}
          className="w-fit"
        >
          <ChevronLeft size={28} />
        </Link>
        <StockDetailLayout />
      </div>

      <div className="pl-2 basis-[55%] flex-shrink-0 min-w-0">
        <ChatContainer stockSlug={stockSlug} />
      </div>
    </div>
  );
}
