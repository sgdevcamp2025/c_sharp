import { Avatar, AvatarFallback, AvatarImage, Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components';

//로고 이미지 경로 변경 필요
const Header = () => {
  return (
    <header className="h-[68px] w-full flex items-center justify-between px-2 py-1 bg-muted">
      <Avatar variant="square">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>logo</AvatarFallback>
      </Avatar>
      <Popover>
        <PopoverTrigger asChild>
          <Avatar
            variant="default"
            className="cursor-pointer"
          >
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>Avatar</AvatarFallback>
          </Avatar>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-72 "
        ></PopoverContent>
      </Popover>
    </header>
  );
};

export default Header;
