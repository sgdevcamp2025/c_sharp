import { Avatar, AvatarImage, AvatarFallback } from '@workspace/ui/components';

import type { ChatContentWithAvatarsProps } from './chat-content';

const AvatarList = ({ avatarUrls }: ChatContentWithAvatarsProps) => {
  if (!avatarUrls) {
    avatarUrls = [
      'https://github.com/shadcn.png',
      'https://github.com/shadcn.png',
      'https://github.com/shadcn.png',
      'https://github.com/shadcn.png',
      'https://github.com/shadcn.png',
      'https://github.com/shadcn.png',
      'https://github.com/shadcn.png',
      'https://github.com/shadcn.png',
    ];
  }

  const displayedAvatars = avatarUrls.slice(0, 5);
  const remainingCount = avatarUrls.length - displayedAvatars.length;

  return (
    <div className="px-1 py-1 mb-0.5 flex gap-1 items-center">
      {displayedAvatars.map((url, index) => (
        <Avatar
          variant="square"
          size="sm"
          key={index}
          className={index === 4 && remainingCount > 0 ? 'relative' : ''}
        >
          <AvatarImage src={url} />
          <AvatarFallback>profile</AvatarFallback>

          {index === 4 && remainingCount > 0 && (
            <div className="absolute top-0 right-0 w-6 h-6 bg-black-100 flex items-center justify-center text-white text-xs">+{remainingCount}</div>
          )}
        </Avatar>
      ))}
      {avatarUrls.length > 0 && <div className="ml-1 text-sm text-thread cursor-pointer">{avatarUrls.length}개의 댓글</div>}
    </div>
  );
};

export default AvatarList;
