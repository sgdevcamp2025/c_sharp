'use client';

import { useRef } from 'react';
import { ChartType, StockChart } from '../model';

type StockChartItem = {
  data: StockChart[];
  type: ChartType;
};

const StockChartItem = ({ data, type }: StockChartItem) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={chartContainerRef}
      className="w-full h-full"
    />
  );
};

export default StockChartItem;
