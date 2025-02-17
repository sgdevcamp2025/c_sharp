import ChatTextArea from './chat-textarea';

const ThreadSection = () => {
  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-1 flex-col w-full h-full overflow-y-auto"></div>
      <div className="p-4">
        <ChatTextArea onSend={() => {}} />
      </div>
    </div>
  );
};

export default ThreadSection;
