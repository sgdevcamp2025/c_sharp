import { Avatar, AvatarImage, AvatarFallback } from '@workspace/ui/components';
import { Headset } from 'lucide-react';

export type ContentAvatarProps = {
  type?: 'default' | 'live';
};

const ContentAvatar = ({ type }: ContentAvatarProps) => {
  return (
    <>
      {type === 'live' ? (
        <div className="bg-primary flex justify-center items-center flex h-10 w-10 shrink-0 overflow-hidden rounded-md">
          <Headset
            size={24}
            color="#fff"
          />
        </div>
      ) : (
        <Avatar variant="square">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>profile</AvatarFallback>
        </Avatar>
      )}
    </>
  );
};

export default ContentAvatar;
