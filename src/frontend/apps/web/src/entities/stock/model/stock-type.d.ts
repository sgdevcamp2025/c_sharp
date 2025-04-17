import { Time } from 'lightweight-charts';

import { CHART_TYPES } from './Stock';

export type ChartType = (typeof CHART_TYPES)[keyof typeof CHART_TYPES];

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

export type StockTable = {
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
  openPrice?: string;
  openingPrice?: string;
  highPrice: string;
  lowPrice: string;
  tradingVolume: string;
  totalTradeAmount: string;
};

export type StockWS = {
  code: string;
  htsKorIsnm: string;
  stckBsopDate: string;
  stckCntgHour: string;
  stckPrpr: string;
  stckOprc: string;
  stckHgpr: string;
  stckLwpr: string;
  cntgVol: string;
  acmlTrPbmn: string;
};

export type RealTimeStock = {
  slug?: string;
  name?: string;
  businessDate?: string;
  code?: string;
  tradingTime?: string;
  currentPrice?: string;
  priceChange?: string;
  openPrice?: string;
  highPrice?: string;
  lowPrice?: string;
  tradingVolume?: string;
  totalTradeAmount?: string;
};
