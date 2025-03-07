import StockInfo from './StockInfo';
import StockLogo from './StockLogo';

const StockInfoContainer = ({
  stockCode,
  stockName,
}: {
  stockCode: string;
  stockName: string;
}) => {
  return (
    <div className="h-full flex flex-row justify-start items-center gap-3 min-w-0">
      <StockLogo />
      <StockInfo />
    </div>
  );
};
export default StockInfoContainer;
