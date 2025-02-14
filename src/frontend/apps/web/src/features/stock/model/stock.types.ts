import { Time } from 'lightweight-charts';

export type Stock = {
  id: string;
  name: string;
  currPrice: string;
  fluctuation: string;
  volume: string;
  slug: string;
};

export type StockChartAPIResponse = {
  businessDate: string;
  tradingTime: string;
  currentPrice: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  tradingVolume: string;
  totalTradeAmount: string;
};

export enum ChartType {
  Candlestick = 'candlestick',
  Line = 'line',
  Histogram = 'histogram',
}

export type CandleChart = {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type DefaultChart = {
  time: Time;
  value: number;
};
