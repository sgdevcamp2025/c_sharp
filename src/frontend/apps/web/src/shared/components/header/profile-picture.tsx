'use client';

import { Avatar, AvatarFallback, AvatarImage, Button, Input } from '@workspace/ui/components';

const ProfilePicture = () => {
  //임시변수
  const isPictureEditMode = false;
  const pictureUrl = 'https://github.com/shadcn.png';

  return (
    <div className="w-full flex flex-col items-end">
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
          <AvatarImage src={pictureUrl} />
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
