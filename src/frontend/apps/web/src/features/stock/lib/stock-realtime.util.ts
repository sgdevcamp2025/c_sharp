const formatRealTimeStock = (data: string) => {
  const stock = data.split('^');

  return {
    businessDate: stock[33] || '',
    code: stock[0] || '',
    tradingTime: stock[1] || '',
    currentPrice: stock[1] || '',
    priceChange: stock[4] || '',
    openPrice: stock[37] || '',
    highPrice: stock[9] || '',
    lowPrice: stock[10] || '',
    tradingVolume: stock[13] || '',
    totalTradeAmount: stock[14] || '',
  };
};
//삭제할 코드
export const STOCKS = {
  'samsung-electronics': { code: '005930', name: '삼성전자' },
  'sk-hynix': { code: '000660', name: 'SK하이닉스' },
  kakao: { code: '035720', name: '카카오' },
  naver: { code: '035420', name: 'NAVER' },
  'hanwha-aerospace': { code: '012450', name: '한화에어로스페이스' },
} as const;

export const StockForTable = (data: string, code: string) => {
  const realTimeData = formatRealTimeStock(data);
  const [key, { name }] = Object.entries(STOCKS).find(
    ([_, value]) => value.code === code,
  );

  return { ...realTimeData, slug: key, name: name };
};
