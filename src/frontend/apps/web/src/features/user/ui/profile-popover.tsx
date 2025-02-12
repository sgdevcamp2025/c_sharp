import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components';
import { CircleUserRound } from 'lucide-react';
import ProfilePopoverContent from './profile-popover-content';

const ProfilePopover = () => {
  return (
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
        <ProfilePopoverContent />
      </PopoverContent>
    </Popover>
  );
};
export default ProfilePopover;
