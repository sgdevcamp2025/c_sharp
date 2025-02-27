import Link from 'next/link';

import { ChevronLeft } from 'lucide-react';

import { ChatContainer } from '@/src/features/chat';
import { StockDetailLayout } from '@/src/features/stock';
import { ChatIdProvider } from '@/src/shared';

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
        <ChatIdProvider stockSlug={stockSlug}>
          <ChatContainer stockSlug={stockSlug} />
        </ChatIdProvider>
      </div>
    </div>
  );
}
