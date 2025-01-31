'use client';

import { Avatar, AvatarFallback, AvatarImage, Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components';
import ProfileContainer from './profile-container';
import { CircleUserRound } from 'lucide-react';

//로고 이미지 경로 변경 필요
const Header = () => {
  return (
    <>
      <Avatar variant="square">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback className="text-primary font-bold">주톡피아</AvatarFallback>
      </Avatar>
      <Popover>
        <PopoverTrigger asChild>
          <Avatar
            variant="default"
            className="cursor-pointer"
          >
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>
              <CircleUserRound size={40} />
            </AvatarFallback>
          </Avatar>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-72 "
        >
          <ProfileContainer />
        </PopoverContent>
      </Popover>
    </>
  );
};

export default Header;
