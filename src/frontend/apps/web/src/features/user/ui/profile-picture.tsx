'use client';

import { useUserStore } from '@/src/entities';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Input,
} from '@workspace/ui/components';

const ProfilePicture = () => {
  const isPictureEditMode = false;
  const profileImage = useUserStore((state) => state.user?.profileImage ?? '');
  return (
    <div className="w-full flex flex-col items-end gap-1">
      {isPictureEditMode ? (
        <Input
          id="picture"
          placeholder="Upload your picture"
        />
      ) : (
        <Avatar
          variant="default"
          className="w-full h-full"
        >
          <AvatarImage src={profileImage} />
          <AvatarFallback>Profile Image</AvatarFallback>
        </Avatar>
      )}
      <Button
        variant="ghost"
        size="sm"
      >
        {isPictureEditMode ? '저장' : '수정하기'}
      </Button>
    </div>
  );
};
export default ProfilePicture;
