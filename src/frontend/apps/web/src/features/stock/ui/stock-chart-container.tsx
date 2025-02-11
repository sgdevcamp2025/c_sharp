import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@workspace/ui/components';
import StockChartItem from './stock-chart-item';
import { ChartType } from '../model';

const StockChartContainer = () => {
  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel
        defaultSize={65}
        minSize={20}
        maxSize={80}
        className="flex items-center justify-center bg-gray-200"
      >
        <StockChartItem
          data={[]}
          type={ChartType.Candlestick}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        defaultSize={35}
        minSize={20}
        maxSize={80}
        className="flex items-center justify-center bg-gray-300"
      >
        <StockChartItem
          data={[]}
          type={ChartType.Histogram}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
export default StockChartContainer;
