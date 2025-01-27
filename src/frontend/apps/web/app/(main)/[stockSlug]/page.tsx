import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@workspace/ui/components';

import Chatbox from '@/src/features/chat/chatbox';

// 주식데이터를 가지고 올수있는 방법이 필요합니다.

// export async function generateMetadata({ params }) {
//   const { stockSlug } = params;
//   const stockData = await getStockData(stockSlug);

//   return {
//     title: `${stockData.name} - 주식 정보`,
//     description: `${stockData.name}의 최신 주식 정보를 확인하세요.`,
//     keywords: `주식, ${stockData.name}, 주식 정보`,
//   };
// }

export default function StockDetailsPage({ params }) {
  const { stockSlug } = params;
  // console.log(1, params);

  return (
    <div className="flex flex-1 flex-row">
      <div className="flex items-center justify-center bg-gray-200 w-[45%] h-full">Stock Chart</div>

      <div className="flex items-center justify-center py-6 pr-[30px] pl-2 bg-gray-400 w-[55%] h-full">
        <Chatbox />
      </div>
    </div>
  );
}
