import ChatHeader from './chat-header';
import ChatSection from './chat-section';

const ChatContainer = () => {
  return (
    <div className="flex  h-full bg-white">
      <aside className="w-44 h-full bg-gray-400 flex-shrink-0">sidebar</aside>

      <div className="flex flex-col w-full h-full">
        <ChatHeader />
        <ChatSection />
      </div>
    </div>
  );
};

export default ChatContainer;
