import StockChartContainer from './stock-chart-container';
import StockInfoContainer from './stock-info-container';

const StockDetailLayout = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="h-[120px]">
        <StockInfoContainer />
      </div>
      <div className="h-full rounded-md overflow-hidden">
        <StockChartContainer />
      </div>
    </div>
  );
};

export default StockDetailLayout;
