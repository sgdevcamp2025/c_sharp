import StockChartContainer from './stock-chart-container';
import StockInfoContainer from './stock-info-container';

const StockDetailLayout = () => {
  return (
    <div className="bg-gray-200 w-full h-full flex flex-col gap-2">
      <div className="h-1/5 bg-red-400">
        <StockInfoContainer />
      </div>
      <div className="h-full bg-blue-400">
        <StockChartContainer />
      </div>
    </div>
  );
};

export default StockDetailLayout;
