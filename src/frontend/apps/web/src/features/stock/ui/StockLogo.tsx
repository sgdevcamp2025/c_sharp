import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components';

const StockLogo = () => {
  return (
    <>
      <Avatar
        variant="square"
        className="w-[60px] h-[60px]"
      >
        <AvatarImage src="https://thumb.tossinvest.com/image/resized/96x0/https%3A%2F%2Fstatic.toss.im%2Fpng-icons%2Fsecurities%2Ficn-sec-fill-005930.png" />
        <AvatarFallback>Logo</AvatarFallback>
      </Avatar>
    </>
  );
};
export default StockLogo;
