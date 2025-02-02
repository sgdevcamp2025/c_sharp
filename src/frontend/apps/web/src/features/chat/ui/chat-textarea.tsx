'use client';

import { Textarea } from '@workspace/ui/components';
import ChatToggleGroup from './chat-toggle-group';

const ChatTextArea = () => {
  const handleSendClick = () => alert('Send clicked');

  return (
    <div className="flex flex-col w-full rounded-md border bg-secondary border-gray-300 p-2 overflow-auto">
      <Textarea placeholder="Type your message..." />
      <div className="w-full px-2 pt-2">
        <ChatToggleGroup
          name="image"
          onSend={handleSendClick}
        />
      </div>
    </div>
  );
};

export default ChatTextArea;
