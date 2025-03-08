import { describe, it, expect } from 'vitest';
import {
  formatRealTimeStock,
  StockForTable,
  STOCKS,
} from './stockRealTime.util';

describe('formatRealTimeStock', () => {
  it('should correctly parse the stock data from the string', () => {
    // 인덱스 0: code, 1: tradingTime, 2: currentPrice, 5: priceChange,
    // 9: highPrice, 10: lowPrice, 13: tradingVolume, 14: totalTradeAmount,
    // 33: businessDate, 37: openPrice
    const dummyArray = Array(40).fill('dummy');
    dummyArray[0] = '005930';
    dummyArray[1] = '0930';
    dummyArray[2] = '1200';
    dummyArray[5] = '10';
    dummyArray[9] = '1250';
    dummyArray[10] = '1150';
    dummyArray[13] = '100000';
    dummyArray[14] = '5000000';
    dummyArray[33] = '20230101';
    dummyArray[37] = '1010';
    const dataString = dummyArray.join('^');

    const result = formatRealTimeStock(dataString);

    expect(result).toEqual({
      businessDate: '20230101',
      code: '005930',
      tradingTime: '0930',
      currentPrice: '1200',
      priceChange: '10',
      openPrice: '1010',
      highPrice: '1250',
      lowPrice: '1150',
      tradingVolume: '100000',
      totalTradeAmount: '5000000',
    });
  });

  it('should return empty strings for missing indices', () => {
    // 데이터 배열 길이가 부족한 경우: 예를 들어 5개 요소만 있는 경우
    const dataString = 'A^B^C^D^E';
    const result = formatRealTimeStock(dataString);
    expect(result).toEqual({
      businessDate: '',
      code: 'A',
      tradingTime: 'B',
      currentPrice: 'C',
      priceChange: '',
      openPrice: '',
      highPrice: '',
      lowPrice: '',
      tradingVolume: '',
      totalTradeAmount: '',
    });
  });

  it('should return all empty strings when all stock indices are empty', () => {
    // 40개 요소가 모두 빈 문자열인 경우
    const emptyArray = Array(40).fill('');
    const dataString = emptyArray.join('^');
    const result = formatRealTimeStock(dataString);
    expect(result).toEqual({
      businessDate: '',
      code: '',
      tradingTime: '',
      currentPrice: '',
      priceChange: '',
      openPrice: '',
      highPrice: '',
      lowPrice: '',
      tradingVolume: '',
      totalTradeAmount: '',
    });
  });
});

describe('StockForTable', () => {
  it('should correctly combine real time data with stock info from STOCKS', () => {
    // STOCKS에 'naver' 항목: { code: '035420', name: 'NAVER' }가 정의되어 있음
    const dummyArray = Array(40).fill('dummy');
    dummyArray[0] = '035420'; // code
    dummyArray[1] = '1000'; // tradingTime
    dummyArray[2] = '2000'; // currentPrice
    dummyArray[5] = '5'; // priceChange
    dummyArray[9] = '2100'; // highPrice
    dummyArray[10] = '1900'; // lowPrice
    dummyArray[13] = '300000'; // tradingVolume
    dummyArray[14] = '15000000'; // totalTradeAmount
    dummyArray[33] = '20230303'; // businessDate
    dummyArray[37] = '2050'; // openPrice
    const dataString = dummyArray.join('^');

    const result = StockForTable(dataString, '035420');
    expect(result).toEqual({
      businessDate: '20230303',
      code: '035420',
      tradingTime: '1000',
      currentPrice: '2000',
      priceChange: '5',
      openPrice: '2050',
      highPrice: '2100',
      lowPrice: '1900',
      tradingVolume: '300000',
      totalTradeAmount: '15000000',
      slug: 'naver',
      name: 'NAVER',
    });
  });

  it('should throw an error if stock code is not found in STOCKS', () => {
    const dummyArray = Array(40).fill('dummy');
    dummyArray[0] = '999999'; // 존재하지 않는 코드
    dummyArray[33] = '20230303';
    dummyArray[1] = '1000';
    const dataString = dummyArray.join('^');
    expect(() => StockForTable(dataString, '999999')).toThrow();
  });

  it('should combine empty real time data with stock info when real time data is empty', () => {
    // 40개 요소가 모두 빈 문자열인 경우에도 STOCKS 정보를 결합
    const emptyArray = Array(40).fill('');
    const dataString = emptyArray.join('^');
    // STOCKS에 'naver' 항목이 존재하므로, StockForTable은 해당 항목을 사용
    const result = StockForTable(dataString, '035420');
    expect(result).toEqual({
      businessDate: '',
      code: '',
      tradingTime: '',
      currentPrice: '',
      priceChange: '',
      openPrice: '',
      highPrice: '',
      lowPrice: '',
      tradingVolume: '',
      totalTradeAmount: '',
      slug: 'naver',
      name: 'NAVER',
    });
  });
});
