import { useEffect, useRef } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
} from 'lightweight-charts';
import { CandleChart, ChartType, DefaultChart } from './stock.types';

export const useStockChart = (
  chartType: ChartType,
  chartContainerRef: React.RefObject<HTMLDivElement>,
  data: CandleChart[] | DefaultChart[],
) => {
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<keyof typeof ChartType> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });

    chartRef.current = chart;
    chart.timeScale().fitContent();
    chart
      .timeScale()
      .applyOptions({ timeVisible: true, secondsVisible: false });

    let series: ISeriesApi<keyof typeof ChartType>;

    if (chartType === ChartType.Candlestick) {
      series = chart.addSeries(CandlestickSeries, {
        upColor: 'red',
        downColor: 'blue',
        borderUpColor: 'red',
        borderDownColor: 'blue',
        wickUpColor: 'red',
        wickDownColor: 'blue',
      });
    }
    if (chartType === ChartType.Line) {
      series = chart.addSeries(LineSeries, { lineWidth: 2 });
    }
    if (chartType === ChartType.Histogram) {
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
