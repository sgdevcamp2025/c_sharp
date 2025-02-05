import { Badge } from '@workspace/ui/components';

import type { ChatContentWithAvatarsProps } from './chat-content';
import AvatarList from './avatarlist';

const ContentText = ({
  type,
  avatarUrls,
  setIsThreadOpen,
}: ChatContentWithAvatarsProps) => {
  return (
    <div className="flex flex-col ">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="text-base font-bold">shadcn</div>
          <div className="text-base">2021-10-01 12:00</div>
          {type === 'live' && (
            <Badge
              variant="default"
              size="sm"
            >
              Live
            </Badge>
          )}
        </div>
        <div className="text-base">안녕하세요</div>
      </div>
      <div onClick={() => setIsThreadOpen(true)}>
        <AvatarList
          avatarUrls={avatarUrls}
          setIsThreadOpen={setIsThreadOpen}
        />
      </div>
    </div>
  );
};

export default ContentText;
