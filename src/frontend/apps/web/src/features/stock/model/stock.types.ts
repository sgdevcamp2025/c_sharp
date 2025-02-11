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

export type StockChart = {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  tradingVolume: number;
};
