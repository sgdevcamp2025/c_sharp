import { STOCKS } from '@/src/entities/stock';

import StockChartContainer from './StockChartContainer';
import StockInfoContainer from './StockInfoContainer';

const StockDetailLayout = ({ stockSlug }: { stockSlug: string }) => {
  const stockCode = STOCKS[stockSlug].code;
  const stockName = STOCKS[stockSlug].name;

  return (
    <div className="w-full h-full flex flex-col min-w-0">
      <div className="h-[120px]">
        <StockInfoContainer
          stockCode={stockCode}
          stockName={stockName}
        />
      </div>
      <div className="h-full rounded-md overflow-hidden">
        <StockChartContainer stockCode={stockCode} />
      </div>
    </div>
  );
};

export default StockDetailLayout;
