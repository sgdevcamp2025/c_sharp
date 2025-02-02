import StockInfo from './stock-info';
import StockLogo from './stock-logo';

const StockInfoContainer = () => {
  return (
    <div className="h-full flex flex-row justify-start items-center">
      <StockLogo />
      <StockInfo />
    </div>
  );
};
export default StockInfoContainer;
