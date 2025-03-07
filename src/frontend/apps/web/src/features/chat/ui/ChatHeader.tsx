const ChatHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <header className="h-[54px] flex-shrink-0 w-full flex items-center justify-between px-4 bg-white border-b border-gray-200">
      {children}
    </header>
  );
};

export default ChatHeader;
