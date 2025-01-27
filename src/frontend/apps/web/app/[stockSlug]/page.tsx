import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@workspace/ui/components';

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
    <div className="flex flex-col w-screen h-screen">
      <header className="h-[68px] bg-gray-800 flex items-center justify-center text-white">Header</header>
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full"
        >
          <ResizablePanel
            defaultSize={45}
            className="flex items-center justify-center bg-gray-200 p-4 h-full"
          >
            Stock Chart
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            defaultSize={55}
            className="flex items-center justify-center bg-gray-300 p-4 h-full"
          >
            ChatList
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
