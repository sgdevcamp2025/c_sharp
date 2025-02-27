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
