import StockInfo from './stock-info';
import StockLogo from './stock-logo';

const StockInfoContainer = () => {
  return (
    <div className="h-full flex flex-row justify-start items-center gap-3 min-w-0">
      <StockLogo />
      <StockInfo />
    </div>
  );
};
export default StockInfoContainer;
