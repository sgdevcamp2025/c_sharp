'use client';
import { CircleUserRound } from 'lucide-react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components';

import { useUserStore } from '@/src/shared';

import ProfilePopoverContent from './ProfilePopoverContent';

const ProfilePopover = () => {
  const profileImage = useUserStore((state) => state.user?.profileImage ?? '');
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Avatar
          variant="default"
          className="cursor-pointer"
        >
          <AvatarImage src={profileImage} />
          <AvatarFallback>
            <CircleUserRound size={40} />
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72 "
      >
        <ProfilePopoverContent />
      </PopoverContent>
    </Popover>
  );
};
export default ProfilePopover;
