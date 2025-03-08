import { describe, it, expect } from 'vitest';
import { Time, UTCTimestamp } from 'lightweight-charts';

import type {
  StockChartAPIResponse,
  CandleChart,
  DefaultChart,
} from '@/src/entities/stock';

import {
  formatTimeForChart,
  formatChartData,
  formatCandleChart,
  formatLineChart,
  formatHistogramChart,
} from './stockChart.util';

describe('formatTimeForChart', () => {
  it('should return UTCTimestamp for valid inputs', () => {
    const businessDate = '20230101';
    const tradingTime = '0915';
    const expectedTimestamp = Math.floor(Date.UTC(2023, 0, 1, 9, 15) / 1000);
    expect(formatTimeForChart(businessDate, tradingTime)).toEqual(
      expectedTimestamp,
    );
  });

  it('should return null if businessDate is invalid', () => {
    expect(formatTimeForChart('202301', '0915')).toBeNull();
  });

  it('should return null if tradingTime is invalid', () => {
    expect(formatTimeForChart('20230101', '915')).toBeNull();
  });

  it('should return null if businessDate or tradingTime is falsy', () => {
    expect(formatTimeForChart('', '0915')).toBeNull();
    expect(formatTimeForChart('20230101', '')).toBeNull();
  });
});

describe('formatChartData', () => {
  // 더미 형식 함수: 주어진 항목과 시간을 그대로 포함하는 객체 반환
  const dummyFormatFn = (item: StockChartAPIResponse, time: Time) => ({
    time,
    currentPrice: item.currentPrice,
  });

  it('should return an empty array when response is falsy', () => {
    expect(formatChartData(undefined as any, dummyFormatFn)).toEqual([]);
  });

  it('should filter out items with invalid time', () => {
    const validResponse: StockChartAPIResponse = {
      businessDate: '20230101',
      tradingTime: '0915',
      currentPrice: '105.3',
      openPrice: '100.5',
      openingPrice: undefined,
      highPrice: '110.2',
      lowPrice: '99.8',
      tradingVolume: '0',
      totalTradeAmount: '0',
    };
    const invalidResponse: StockChartAPIResponse = {
      businessDate: 'invalid',
      tradingTime: '0915',
      currentPrice: '205.3',
      openPrice: '200.5',
      openingPrice: undefined,
      highPrice: '210.2',
      lowPrice: '199.8',
      tradingVolume: '0',
      totalTradeAmount: '0',
    };
    const responses: StockChartAPIResponse[] = [validResponse, invalidResponse];
    const expectedTime = Math.floor(
      Date.UTC(2023, 0, 1, 9, 15) / 1000,
    ) as UTCTimestamp;
    const expected = [
      {
        time: expectedTime,
        currentPrice: validResponse.currentPrice,
      },
    ];
    expect(formatChartData(responses, dummyFormatFn)).toEqual(expected);
  });
});

describe('formatCandleChart', () => {
  it('should format candle chart data correctly using openPrice', () => {
    const response: StockChartAPIResponse[] = [
      {
        businessDate: '20230101',
        tradingTime: '0915',
        openPrice: '100.5',
        openingPrice: undefined,
        highPrice: '110.2',
        lowPrice: '99.8',
        currentPrice: '105.3',
        tradingVolume: '0',
        totalTradeAmount: '0',
      },
    ];
    const expectedTime = Math.floor(Date.UTC(2023, 0, 1, 9, 15) / 1000) as Time;
    const expected: CandleChart[] = [
      {
        time: expectedTime,
        open: 100.5,
        high: 110.2,
        low: 99.8,
        close: 105.3,
      },
    ];
    expect(formatCandleChart(response)).toEqual(expected);
  });

  it('should use openingPrice if openPrice is not provided', () => {
    const response: StockChartAPIResponse[] = [
      {
        businessDate: '20230101',
        tradingTime: '0915',
        openPrice: undefined,
        openingPrice: '101.0',
        highPrice: '111.0',
        lowPrice: '100.0',
        currentPrice: '106.0',
        tradingVolume: '0',
        totalTradeAmount: '0',
      },
    ];
    const expectedTime = Math.floor(Date.UTC(2023, 0, 1, 9, 15) / 1000) as Time;
    const expected: CandleChart[] = [
      {
        time: expectedTime,
        open: 101.0,
        high: 111.0,
        low: 100.0,
        close: 106.0,
      },
    ];
    expect(formatCandleChart(response)).toEqual(expected);
  });

  it('should filter out items with invalid time', () => {
    const response: StockChartAPIResponse[] = [
      {
        businessDate: '20230101',
        tradingTime: '0915',
        openPrice: '100.5',
        openingPrice: undefined,
        highPrice: '110.2',
        lowPrice: '99.8',
        currentPrice: '105.3',
        tradingVolume: '0',
        totalTradeAmount: '0',
      },
      {
        businessDate: 'invalid',
        tradingTime: '0915',
        openPrice: '200.5',
        openingPrice: undefined,
        highPrice: '210.2',
        lowPrice: '199.8',
        currentPrice: '205.3',
        tradingVolume: '0',
        totalTradeAmount: '0',
      },
    ];
    const expectedTime = Math.floor(Date.UTC(2023, 0, 1, 9, 15) / 1000) as Time;
    const expected: CandleChart[] = [
      {
        time: expectedTime,
        open: 100.5,
        high: 110.2,
        low: 99.8,
        close: 105.3,
      },
    ];
    expect(formatCandleChart(response)).toEqual(expected);
  });
});

describe('formatLineChart', () => {
  it('should format line chart data correctly', () => {
    const response: StockChartAPIResponse[] = [
      {
        businessDate: '20230101',
        tradingTime: '0915',
        currentPrice: '105.3',
        openPrice: '0',
        openingPrice: undefined,
        highPrice: '0',
        lowPrice: '0',
        tradingVolume: '0',
        totalTradeAmount: '0',
      },
    ];
    const expectedTime = Math.floor(Date.UTC(2023, 0, 1, 9, 15) / 1000) as Time;
    const expected: DefaultChart[] = [
      {
        time: expectedTime,
        value: 105.3,
      },
    ];
    expect(formatLineChart(response)).toEqual(expected);
  });

  it('should filter out items with invalid time', () => {
    const response: StockChartAPIResponse[] = [
      {
        businessDate: '20230101',
        tradingTime: '0915',
        currentPrice: '105.3',
        openPrice: '0',
        openingPrice: undefined,
        highPrice: '0',
        lowPrice: '0',
        tradingVolume: '0',
        totalTradeAmount: '0',
      },
      {
        businessDate: '2023',
        tradingTime: '0915',
        currentPrice: '205.3',
        openPrice: '0',
        openingPrice: undefined,
        highPrice: '0',
        lowPrice: '0',
        tradingVolume: '0',
        totalTradeAmount: '0',
      },
    ];
    const expectedTime = Math.floor(Date.UTC(2023, 0, 1, 9, 15) / 1000) as Time;
    const expected: DefaultChart[] = [
      {
        time: expectedTime,
        value: 105.3,
      },
    ];
    expect(formatLineChart(response)).toEqual(expected);
  });
});

describe('formatHistogramChart', () => {
  it('should format histogram chart data correctly', () => {
    const response: StockChartAPIResponse[] = [
      {
        businessDate: '20230101',
        tradingTime: '0915',
        tradingVolume: '2000',
        currentPrice: '0',
        openPrice: '0',
        openingPrice: undefined,
        highPrice: '0',
        lowPrice: '0',
        totalTradeAmount: '0',
      },
    ];
    const expectedTime = Math.floor(Date.UTC(2023, 0, 1, 9, 15) / 1000) as Time;
    const expected: DefaultChart[] = [
      {
        time: expectedTime,
        value: 2000,
      },
    ];
    expect(formatHistogramChart(response)).toEqual(expected);
  });

  it('should filter out items with invalid time', () => {
    const response: StockChartAPIResponse[] = [
      {
        businessDate: '20230101',
        tradingTime: '0915',
        tradingVolume: '2000',
        currentPrice: '0',
        openPrice: '0',
        openingPrice: undefined,
        highPrice: '0',
        lowPrice: '0',
        totalTradeAmount: '0',
      },
      {
        businessDate: 'invalid',
        tradingTime: '0915',
        tradingVolume: '3000',
        currentPrice: '0',
        openPrice: '0',
        openingPrice: undefined,
        highPrice: '0',
        lowPrice: '0',
        totalTradeAmount: '0',
      },
    ];
    const expectedTime = Math.floor(Date.UTC(2023, 0, 1, 9, 15) / 1000) as Time;
    const expected: DefaultChart[] = [
      {
        time: expectedTime,
        value: 2000,
      },
    ];
    expect(formatHistogramChart(response)).toEqual(expected);
  });
});
