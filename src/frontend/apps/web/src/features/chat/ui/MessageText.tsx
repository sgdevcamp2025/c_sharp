import Image from 'next/image';

import { Badge } from '@workspace/ui/components';
import type { WebSocketResponsePayload } from '@/src/entities/chat';

import { formatChatTime } from '../lib';

type MessageTextProps = {
  type?: 'default' | 'live';
  message: WebSocketResponsePayload;
  hideUserInfo?: boolean;
};

const MessageText = ({
  type,
  message,
  hideUserInfo = false,
}: MessageTextProps) => {
  const formattedTime = formatChatTime(
    message.common.threadDateTime,
    hideUserInfo,
  );
  // console.log('messages!', message);

  return (
    <div className="flex w-full justify-between">
      <div className="flex flex-col w-full group">
        {/* ---- 상단: 닉네임 + 시간 + 뱃지 ---- */}
        {!hideUserInfo && (
          <div className="flex items-center gap-2 mb-2">
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
        )}

        {/* ---- 메시지 내용 (TEXT + IMAGE + VIDEO) ---- */}
        <div className="flex flex-col">
          {message.message.map((msg, idx) => {
            if (msg.type === 'TEXT') {
              return (
                <div
                  key={idx}
                  className="flex gap-4 items-center"
                >
                  {hideUserInfo && (
                    <div className="w-10 opacity-0 group-hover:opacity-100 transition-opacity text-sm text-gray-500">
                      {formattedTime}
                    </div>
                  )}
                  <div className="whitespace-pre-line break-words pb-2 text-base">
                    {msg.text.replace(/\\n/g, '\n')}
                  </div>
                </div>
              );
            }
            return null;
          })}

          <div
            className={`flex flex-wrap gap-4 ${hideUserInfo ? 'pl-14' : ''}`}
          >
            {message.message.map((msg, idx) => {
              if (msg.type === 'IMAGE') {
                return (
                  <Image
                    key={idx}
                    src={msg.imageUrl}
                    alt="Image"
                    width={256}
                    height={256}
                    className="max-w-72 max-h-72 object-cover border border-gray-300 rounded-md"
                  />
                );
              }
              if (msg.type === 'VIDEO') {
                return (
                  <video
                    key={idx}
                    controls
                    className="w-48 h-48 object-cover border border-rounded-md border-gray-300 rounded-md"
                  >
                    <source
                      src={msg.videoUrl}
                      type="video/mp4"
                    />
                  </video>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageText;
