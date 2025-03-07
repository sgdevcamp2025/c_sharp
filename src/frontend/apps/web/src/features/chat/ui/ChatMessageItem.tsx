import React from 'react';

import type { WebSocketResponsePayload } from '@/src/entities/chat';

import ContentText from './MessageText';
import ContentAvatar from './MessageAvatar';

type ChatMessageItemProps = {
  messageData: WebSocketResponsePayload & {
    isConsecutive: boolean;
    hideAvatar: boolean;
  };
};

const ChatMessageItem: React.FC<
  ChatMessageItemProps & { type?: 'default' | 'live' }
> = ({ messageData, type = 'default' }) => {
  const hoverColor = type === 'default' ? 'hover:bg-chatboxHover' : '';

  return (
    <div
      className={`group relative flex w-full pt-5 pl-5 pr-6 gap-4 ${hoverColor} transition-all duration-300`}
    >
      {messageData.hideAvatar ? null : (
        <ContentAvatar
          type={type}
          userProfileImage={messageData.common.userProfileImage}
        />
      )}
      <div className="flex w-full items-start justify-between">
        <ContentText
          type={type}
          message={messageData}
          hideUserInfo={messageData.isConsecutive}
        />
      </div>
    </div>
  );
};

export default ChatMessageItem;
