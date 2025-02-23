import Image from 'next/image';

import { Badge } from '@workspace/ui/components';

import type { WebSocketResponsePayload } from '../model';
import { formatChatTime } from '../lib';
// import { MessageSquareText } from 'lucide-react';
// import AvatarList from './avatarlist';
// import type { ChatContentWithAvatarsProps } from './chat-content';

export type ContentTextProps = {
  type?: 'default' | 'live';
  // avatarUrls?: string[];
  message: WebSocketResponsePayload;
  // setIsThreadOpen: (value: boolean) => void;
  hideUserInfo?: boolean;
};

const ContentText = ({
  type,
  message,
  hideUserInfo = false,
}: ContentTextProps) => {
  console.log('123', message);
  const formattedTime = formatChatTime(
    message.common.threadDateTime,
    hideUserInfo,
  );

  return (
    <div className="flex w-full justify-between">
      <div className="flex flex-col">
        <div className="flex flex-col">
          {!hideUserInfo ? (
            <div className="flex items-center gap-2">
              <div className="text-base font-bold">
                {message.common.userNickname}
              </div>
              <div className="text-sm text-gray-500">{formattedTime}</div>
              {type === 'live' && (
                <Badge
                  variant="default"
                  size="sm"
                >
                  Live
                </Badge>
              )}
            </div>
          ) : (
            <></>
          )}
          {message.message.map((msg, idx) => (
            <div
              key={idx}
              className="text-base flex gap-4 items-center"
            >
              {hideUserInfo && (
                <div className="flex flex-col items-end w-10 h-full text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                  {formattedTime}
                </div>
              )}
              {msg.type === 'TEXT' && (
                <div className="whitespace-pre-line break-words">
                  {msg.text.replace(/\\n/g, '\n')}
                </div>
              )}
              {msg.type === 'IMAGE' && (
                <Image
                  src={msg.imageUrl}
                  alt="Image"
                  width={256}
                  height={256}
                  className="max-w-72 max-h-72 object-cover border border-gray-300 rounded-md"
                />
              )}
              {msg.type === 'VIDEO' && (
                <video
                  controls
                  className="w-48 h-48"
                >
                  <source
                    src={msg.videoUrl}
                    type="video/mp4"
                  />
                </video>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentText;
