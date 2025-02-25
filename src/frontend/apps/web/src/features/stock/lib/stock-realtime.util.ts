export const formatRealTimeStock = (data) => {
  const stock = data.split('^');

  return {
    businessDate: stock[33] || '',
    code: stock[0] || '',
    tradingTime: stock[1] || '',
    currentPrice: stock[1] || '',
    priceChange: stock[2] || '',
    openPrice: stock[37] || '',
    highPrice: stock[9] || '',
    lowPrice: stock[10] || '',
    tradingVolume: stock[13] || '',
    totalTradeAmount: stock[14] || '',
  };
};
