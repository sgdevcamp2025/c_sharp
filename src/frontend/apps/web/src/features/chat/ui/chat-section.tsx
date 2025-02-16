import { RQProvider } from '@/src/shared/components';

import ChatSectionContent from './chat-section-content';

const ChatSection = () => {
  return (
    <div className="relative flex flex-1 h-full">
      <RQProvider>
        <ChatSectionContent />
      </RQProvider>
    </div>
  );
};

export default ChatSection;
