import ContentText from './content-text';
import ContentAvatar from './content-avatar';

import { MessageSquareText } from 'lucide-react';

export type ChatContentProps = {
  type?: 'default' | 'live';
};

export type ChatContentWithAvatarsProps = ChatContentProps & {
  avatarUrls?: string[];
  setIsThreadOpen: (value: boolean) => void;
};

const ChatContent = ({
  type = 'live',
  avatarUrls,
  setIsThreadOpen,
}: ChatContentWithAvatarsProps) => {
  const backgroundColor = type === 'live' ? 'bg-live' : 'bg-white';
  const hoverColor = type === 'default' ? 'hover:bg-chatboxHover' : '';

  return (
    <div
      className={`flex w-full h-auto ${backgroundColor} pb-2 pl-5 pt-5 pr-6 gap-4 group relative ${hoverColor} transition-all duration-300`}
    >
      <ContentAvatar type={type} />
      <div className="flex w-full items-start justify-between">
        <ContentText
          type={type}
          avatarUrls={avatarUrls}
          setIsThreadOpen={setIsThreadOpen}
        />
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
          <MessageSquareText
            size="15"
            className="cursor-pointer hover:text-gray-600"
            onClick={() => setIsThreadOpen(true)}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatContent;
