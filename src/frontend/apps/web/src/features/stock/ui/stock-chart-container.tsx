import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@workspace/ui/components';

const StockChartContainer = () => {
  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel
        defaultSize={70}
        className="flex items-center justify-center bg-gray-200 p-4"
      >
        주식차트
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        defaultSize={30}
        className="flex items-center justify-center bg-gray-300 p-4"
      >
        거래량 캔들차트
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
export default StockChartContainer;
