'use client';

import { SidebarInset, SidebarProvider } from '@workspace/ui/components';
import { SidebarContainer } from '@/src/features/workspace';

import ChatHeader from './chat-header';
import ChatSection from './chat-section';
import { useWebSocketClient } from '../model';
import { useEffect } from 'react';

const ChatContainer = ({ stockSlug }: { stockSlug: string }) => {
  const channelId = 1;
  const { subscribe, isConnected } = useWebSocketClient(channelId);

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribe();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribe, isConnected]);

  return (
    <SidebarProvider className="flex w-full h-full min-w-0 min-h-0 border  rounded-md overflow-hidden">
      <SidebarContainer stockSlug={stockSlug} />
      <SidebarInset className="flex flex-col min-w-0 min-h-0 w-full h-full">
        <ChatHeader stockSlug={stockSlug} />
        <ChatSection />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ChatContainer;
