import StockChartContainer from './stock-chart-container';
import StockInfoContainer from './stock-info-container';

const StockDetailLayout = () => {
  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="h-1/5 bg-red-400">
        <StockInfoContainer />
      </div>
      <div className="h-full rounded-md overflow-hidden">
        <StockChartContainer />
      </div>
    </div>
  );
};

export default StockDetailLayout;
