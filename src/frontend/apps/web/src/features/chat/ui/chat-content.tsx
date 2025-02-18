import ContentText from './content-text';
import ContentAvatar from './content-avatar';

import { MessageSquareText } from 'lucide-react';
import type { WebSocketResponsePayload } from '../model';
import { processMessages } from '../lib';

export type ChatContentProps = {
  type?: 'default' | 'live';
  messages?: WebSocketResponsePayload[];
};

// export type ChatContentWithAvatarsProps = ChatContentProps & {
//   // avatarUrls?: string[];
//   // setIsThreadOpen: (value: boolean) => void;
// };

const ChatContent = ({
  type = 'default',
  messages = [],
  // avatarUrls,
  // setIsThreadOpen,
}: ChatContentProps) => {
  if (!messages || messages.length === 0) return null;
  console.log('🔗 ChatContent:', { messages });

  const backgroundColor = type === 'live' ? 'bg-live' : 'bg-white';
  const hoverColor = type === 'default' ? 'hover:bg-chatboxHover' : '';

  const processedMessages = processMessages(messages);

  return (
    <>
      <div
        className={`flex flex-col w-full pb-2 overflow-auto h-auto ${backgroundColor}`}
      >
        {processedMessages.map((messageData, index) => (
          <div
            key={index}
            className={`group relative flex w-full pl-5 ${
              messageData.isConsecutive ? 'pt-2' : 'pt-5'
            } pl-5 pr-6 gap-4 ${hoverColor} transition-all duration-300`}
          >
            {messageData.hideAvatar ? (
              <></>
            ) : (
              <ContentAvatar
                type={type}
                userProfileImage={messageData.common.userProfileImage}
              />
            )}

            <div className="flex w-full items-start justify-between">
              <ContentText
                type={type}
                // avatarUrls={avatarUrls}
                message={messageData}
                // setIsThreadOpen={setIsThreadOpen}
                hideUserInfo={messageData.isConsecutive}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ChatContent;
