'use client';

import { useState } from 'react';

import ChatContent from './chat-content';
import ChatTextarea from './chat-textarea';
import ThreadPanel from './thread-panel';

const ChatSection = () => {
  const [isThreadOpen, setIsThreadOpen] = useState(false);

  return (
    <div className="relative flex flex-1 h-full">
      {/* Main Chat Area */}
      <div className="flex flex-col w-full h-full">
        <div className="flex flex-1 flex-col w-full h-full overflow-y-auto">
          <ChatContent setIsThreadOpen={setIsThreadOpen} />
        </div>
        <div className="p-4">
          <ChatTextarea />
        </div>
      </div>

      {/* Thread Panel Overlay */}
      <div
        className={`absolute top-0 right-0 h-full w-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isThreadOpen ? 'translate-x-0' : 'translate-x-full'
        } w-96 z-50`}
      >
        {isThreadOpen && <ThreadPanel onClose={() => setIsThreadOpen(false)} />}
      </div>
    </div>
  );
};

export default ChatSection;
