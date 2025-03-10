export const STOCKS = {
  'samsung-electronics': { code: '005930', name: '삼성전자' },
  'sk-hynix': { code: '000660', name: 'SK하이닉스' },
  kakao: { code: '035720', name: '카카오' },
  naver: { code: '035420', name: 'NAVER' },
  'hanwha-aerospace': { code: '012450', name: '한화에어로스페이스' },
} as const;

export const CHART_TYPES = {
  Candlestick: 'candlestick',
  Line: 'line',
  Histogram: 'histogram',
};
