'use client';

import { useEffect, useRef, useState } from 'react';
import {
  CandleChart,
  ChartType,
  DefaultChart,
  StockChartAPIResponse,
  useStockChart,
} from '../model';
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
      case ChartType.Candlestick:
        setFormattedData(formatCandleChart(data));
        break;
      case ChartType.Line:
        setFormattedData(formatLineChart(data));
        break;
      case ChartType.Histogram:
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
