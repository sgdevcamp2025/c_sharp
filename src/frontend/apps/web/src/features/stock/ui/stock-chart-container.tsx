'use client';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@workspace/ui/components';
import StockChartItem from './stock-chart-item';
import { ChartType, dummyStockData, useStockWebSocket } from '../model';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/src/shared/services';

const StockChartContainer = () => {
  const queryClient = useQueryClient();
  const data = dummyStockData;
  const { subscribe } = useStockWebSocket();

  useEffect(() => {
    return subscribe();
  }, [subscribe]);

  const stockData = queryClient
    .getQueryData<any[]>(QUERY_KEYS.stocks())
    ?.filter((data) => data.code === '035420');
  const stocksDataForTest = queryClient.getQueryData<any[]>(
    QUERY_KEYS.stocks(),
  );

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel
        defaultSize={65}
        minSize={20}
        maxSize={80}
        className="flex items-center justify-center bg-gray-200"
      >
        <StockChartItem
          data={data}
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
          data={data}
          type={ChartType.Histogram}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
export default StockChartContainer;
