const StockInfo = () => {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <span className="font-bold mr-1">테슬라</span>
        <span>000000</span>
      </div>
      <div>
        <span className="font-bold mr-2">579,913</span>
        <span className="text-xs">
          어제보다 <span className="text-red-700">+6.72(0.2%)</span>
        </span>
      </div>
    </div>
  );
};
export default StockInfo;
