'use client';

import { useEffect, useRef, useState } from 'react';

import {
  CHART_TYPES,
  CandleChart,
  DefaultChart,
  StockChartAPIResponse,
  type ChartType,
} from '@/src/entities/stock';

import { useStockChart } from '../model';
import {
  formatCandleChart,
  formatHistogramChart,
  formatLineChart,
} from '../lib';

type StockChartItem = {
  data: StockChartAPIResponse[];
  type: ChartType;
};

const StockChartItem = ({ data, type }: StockChartItem) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  const [formattedData, setFormattedData] = useState<
    CandleChart[] | DefaultChart[]
  >([]);

  useEffect(() => {
    switch (type) {
      case CHART_TYPES.Candlestick:
        setFormattedData(formatCandleChart(data));
        break;
      case CHART_TYPES.Line:
        setFormattedData(formatLineChart(data));
        break;
      case CHART_TYPES.Histogram:
        setFormattedData(formatHistogramChart(data));
        break;
      default:
        setFormattedData([]);
    }
  }, [type, data]);

  useStockChart(type, chartContainerRef, formattedData);

  return (
    <div
      ref={chartContainerRef}
      className="w-full h-full"
    />
  );
};

export default StockChartItem;
