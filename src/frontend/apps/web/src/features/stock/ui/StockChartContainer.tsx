'use client';
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@workspace/ui/components';
import { QUERY_KEYS } from '@/src/shared/services';
import { dummyStockData } from '@/src/shared';
import { ChartType, type StockChartAPIResponse } from '@/src/entities/stock';

import StockChartItem from './StockChartItem';
import { useStockWebSocket } from '../model';
import { fetchStock } from '../api';

const StockChartContainer = ({ stockCode }: { stockCode: string }) => {
  const { subscribe } = useStockWebSocket();

  useEffect(() => {
    return subscribe();
  }, [subscribe]);

  const { data: stockData } = useQuery<StockChartAPIResponse[]>({
    queryKey: QUERY_KEYS.stock(stockCode),
    queryFn: () => fetchStock(stockCode),
    staleTime: Infinity,
  });

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel
        defaultSize={65}
        minSize={20}
        maxSize={80}
        className="flex items-center justify-center bg-gray-200"
      >
        <StockChartItem
          data={stockData}
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
          data={stockData}
          type={ChartType.Histogram}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
export default StockChartContainer;
