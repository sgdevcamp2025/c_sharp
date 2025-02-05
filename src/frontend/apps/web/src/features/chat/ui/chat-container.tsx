import { SidebarInset, SidebarProvider } from '@workspace/ui/components';
import { SidebarContainer } from '@/src/shared/components/sidebar';

import ChatHeader from './chat-header';
import ChatSection from './chat-section';

const ChatContainer = ({ stockSlug }: { stockSlug: string }) => {
  return (
    <SidebarProvider className="flex w-full h-full min-w-0 min-h-0 border  rounded-md overflow-hidden">
      <SidebarContainer />
      <SidebarInset className="flex flex-col min-w-0 min-h-0 w-full h-full">
        <ChatHeader stockSlug={stockSlug} />
        <ChatSection />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ChatContainer;
