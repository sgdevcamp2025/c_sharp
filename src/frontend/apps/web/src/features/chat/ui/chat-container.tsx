import { SidebarInset, SidebarProvider } from '@workspace/ui/components';
import ChatHeader from './chat-header';
import ChatSection from './chat-section';
import { SidebarContainer } from '@/src/shared/components/sidebar';

const ChatContainer = () => {
  return (
    <SidebarProvider className="flex w-full h-full min-w-0 min-h-0 bg-white">
      <SidebarContainer />
      <SidebarInset className="flex flex-col min-w-0 min-h-0 w-full h-full bg-red-400">
        <ChatHeader />
        <ChatSection />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ChatContainer;
