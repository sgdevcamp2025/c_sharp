'use client';

import { useEffect, useRef } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
} from 'lightweight-charts';

import {
  CHART_TYPES,
  type ChartType,
  type CandleChart,
  type DefaultChart,
} from '@/src/entities/stock';

export const useStockChart = (
  chartType: ChartType,
  chartContainerRef: React.RefObject<HTMLDivElement>,
  data: CandleChart[] | DefaultChart[],
) => {
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<keyof typeof CHART_TYPES> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });

    chartRef.current = chart;
    chart
      .timeScale()
      .applyOptions({ timeVisible: true, secondsVisible: false });

    let series: ISeriesApi<keyof typeof CHART_TYPES>;

    if (chartType === CHART_TYPES.Candlestick) {
      series = chart.addSeries(CandlestickSeries, {
        upColor: 'red',
        downColor: 'blue',
        borderUpColor: 'red',
        borderDownColor: 'blue',
        wickUpColor: 'red',
        wickDownColor: 'blue',
      });
    }
    if (chartType === CHART_TYPES.Line) {
      series = chart.addSeries(LineSeries, { lineWidth: 2 });
    }
    if (chartType === CHART_TYPES.Histogram) {
      series = chart.addSeries(HistogramSeries, { color: '#26a69a' });
    }
    seriesRef.current = series;
    series.setData(data);

    const observer = new ResizeObserver(() => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.resize(
          chartContainerRef.current.clientWidth,
          chartContainerRef.current.clientHeight,
        );
      }
    });
    observer.observe(chartContainerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
    };
  }, [chartType, data]);

  return { chartRef, seriesRef };
};
