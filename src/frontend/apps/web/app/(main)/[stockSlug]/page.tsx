import { ChatContainer } from '@/src/features/chat';
import { StockLayout } from '@/src/features/stock';

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
    <div className="flex flex-1 flex-row bg-gray-400 py-6 px-[30px]">
      <div className="flex items-center justify-center pr-2 bg-gray-600 w-[45%] h-full">
        <StockLayout />
      </div>

      <div className="flex items-center justify-center pl-2 bg-gray-500 w-[55%] h-full">
        <ChatContainer />
      </div>
    </div>
  );
}
