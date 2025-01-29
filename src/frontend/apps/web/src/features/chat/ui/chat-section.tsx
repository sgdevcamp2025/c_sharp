import { ChatTextarea } from '@workspace/ui/components';
import ChatContent from './chat-content';

const ChatSection = () => {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="flex flex-1 flex-col h-full overflow-y-auto">
        <ChatContent />
      </div>
      <ChatTextarea
        onSend=""
        onAdd=""
      />
    </div>
  );
};

export default ChatSection;
