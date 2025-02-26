import { Time, UTCTimestamp } from 'lightweight-charts';
import { CandleChart, DefaultChart, StockChartAPIResponse } from '../model';

const formatTimeForChart = (
  businessDate: string,
  tradingTime: string,
): Time | null => {
  if (
    !businessDate ||
    businessDate.length !== 8 ||
    !tradingTime ||
    tradingTime.length < 4
  ) {
    return null;
  }

  const year = Number(businessDate.slice(0, 4));
  const month = Number(businessDate.slice(4, 6));
  const day = Number(businessDate.slice(6, 8));
  const hour = Number(tradingTime.slice(0, 2));
  const minute = Number(tradingTime.slice(2, 4));

  const dateObj = new Date(Date.UTC(year, month - 1, day, hour, minute));

  return Math.floor(dateObj.getTime() / 1000) as UTCTimestamp;
};

const formatChartData = <T>(
  response: StockChartAPIResponse[],
  formatFn: (item: StockChartAPIResponse, time: Time) => T,
): T[] => {
  return response
    ? response
        .map((item) => {
          const formattedTime = formatTimeForChart(
            item.businessDate,
            item.tradingTime,
          );
          if (!formattedTime) return null;
          return formatFn(item, formattedTime);
        })
        .filter((item): item is T => item !== null)
    : [];
};

export const formatCandleChart = (
  response: StockChartAPIResponse[],
): CandleChart[] =>
  formatChartData<CandleChart>(response, (item, time) => ({
    time,
    open: parseFloat(item.openPrice ?? item.openingPrice),
    high: parseFloat(item.highPrice),
    low: parseFloat(item.lowPrice),
    close: parseFloat(item.currentPrice),
  }));

export const formatLineChart = (
  response: StockChartAPIResponse[],
): DefaultChart[] =>
  formatChartData<DefaultChart>(response, (item, time) => ({
    time,
    value: parseFloat(item.currentPrice),
  }));

export const formatHistogramChart = (
  response: StockChartAPIResponse[],
): DefaultChart[] =>
  formatChartData<DefaultChart>(response, (item, time) => ({
    time,
    value: parseFloat(item.tradingVolume),
  }));
