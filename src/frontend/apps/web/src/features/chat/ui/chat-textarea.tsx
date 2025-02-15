'use client';

import { useState } from 'react';
import { Textarea } from '@workspace/ui/components';
import ChatToggleGroup from './chat-toggle-group';

const ChatTextArea = ({
  onSend,
}: {
  onSend: (content: string, attachmentList: number[]) => void;
}) => {
  const [message, setMessage] = useState('');
  const [attachmentList, setAttachmentList] = useState<number[]>([]);

  const handleSendClick = () => {
    if (!message.trim() && attachmentList.length === 0) return;
    onSend(message, attachmentList);
    setMessage('');
    setAttachmentList([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  return (
    <div className="flex flex-col w-full rounded-md border bg-secondary border-gray-300 p-2 overflow-auto">
      <Textarea
        placeholder="Type your message..."
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
        }}
        onKeyDown={handleKeyDown}
      />
      <div className="w-full px-2 pt-2">
        <ChatToggleGroup
          name="image"
          onSend={handleSendClick}
          setAttachmentList={setAttachmentList}
        />
      </div>
    </div>
  );
};

export default ChatTextArea;
