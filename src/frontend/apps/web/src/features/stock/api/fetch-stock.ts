'use server';
import { serverFetchInstance } from '@/src/shared';
import { StockChartAPIResponse } from '../model';

type Res = {
  code: string;
  stockName: string;
  output: StockChartAPIResponse[];
};
export const fetchStock = async (stockCode: string) => {
  const res = await serverFetchInstance<Res>(
    `/api/v1/stock/candlesticks/${stockCode}?size=800`,
    'GET',
  );
  const uniqueOutput = res.output.filter(
    (item, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          t.businessDate === item.businessDate &&
          t.tradingTime === item.tradingTime,
      ),
  );
  return uniqueOutput;
};
