import { ChatContainer } from '@/src/features/chat';
import { StockDetailLayout } from '@/src/features/stock';

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
  // console.log(1, params);

  return (
    <div className="flex bg-gray-700 py-6 px-[30px] h-full w-full min-w-0 min-h-0">
      <div className="pr-2 basis-[45%] flex-shrink-0 min-w-0">
        <StockDetailLayout />
      </div>

      <div className="pl-2 basis-[55%] flex-shrink-0 min-w-0">
        <ChatContainer />
      </div>
    </div>
  );
}
