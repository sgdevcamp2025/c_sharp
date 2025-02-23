import { STOCK_SLUG_TO_CODE, STOCK_SLUG_TO_NAME } from '../model';
import StockChartContainer from './stock-chart-container';
import StockInfoContainer from './stock-info-container';

const StockDetailLayout = ({ stockSlug }: { stockSlug: string }) => {
  const stockCode = STOCK_SLUG_TO_CODE[stockSlug];
  const stockName = STOCK_SLUG_TO_NAME[stockSlug];
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
