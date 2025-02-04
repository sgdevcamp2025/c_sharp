import ChatContent from './chat-content';
import ChatTextarea from './chat-textarea';

const ChatSection = () => {
  return (
    <div className="flex flex-1 flex-col w-full h-full">
      <div className="flex flex-1 flex-col w-full h-full overflow-y-auto">
        <ChatContent />
      </div>
      <div className="p-4">
        <ChatTextarea />
      </div>
    </div>
  );
};

export default ChatSection;
