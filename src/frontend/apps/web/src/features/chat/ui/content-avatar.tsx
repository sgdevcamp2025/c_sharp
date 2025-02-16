import { Avatar, AvatarImage, AvatarFallback } from '@workspace/ui/components';
import { Headset } from 'lucide-react';

export type ContentAvatarProps = {
  type?: 'default' | 'live';
  userProfileImage: string;
};

const ContentAvatar = ({ type, userProfileImage }: ContentAvatarProps) => {
  return (
    <>
      {type === 'live' ? (
        <div className="bg-primary flex justify-center items-center h-10 w-10 shrink-0 overflow-hidden rounded-md">
          <Headset
            size={24}
            color="#fff"
          />
        </div>
      ) : (
        <Avatar variant="square">
          <AvatarImage src={userProfileImage} />
          <AvatarFallback>profile</AvatarFallback>
        </Avatar>
      )}
    </>
  );
};

export default ContentAvatar;
