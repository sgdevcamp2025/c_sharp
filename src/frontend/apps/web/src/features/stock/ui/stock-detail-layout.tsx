import { STOCKS } from '../model/stock.constants';
import StockChartContainer from './stock-chart-container';
import StockInfoContainer from './stock-info-container';

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
