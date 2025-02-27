'use client';
import { useWebSocket } from '@/src/shared';
import { StockForTable } from '../lib';

const StockInfo = () => {
  const { stockData } = useWebSocket();

  const stock = stockData.filter((data) => data.code === '005930')[0];
  const formatted = StockForTable(stock.data, stock.code);
  // console.log(stock);
  return (
    <div className="flex flex-col gap-2">
      <div>
        <span className="font-bold mr-1">{formatted.name}</span>
        <span>{stock.code}</span>
      </div>
      <div>
        <span className="font-bold mr-2">{formatted.currentPrice}</span>
        <span className="text-xs">
          어제보다 <span className="text-red-700">{formatted.priceChange}</span>
        </span>
      </div>
    </div>
  );
};
export default StockInfo;
