'use client';
import { createContext, useContext, useEffect, useState } from 'react';

import { getWorkspaceId } from '@/src/features/workspace/lib';

type ChatContextType = {
  workspaceId: number | null;
  channelId: number | null;
  setChannelId: (channelId: number) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatIdProvider = ({
  children,
  stockSlug,
}: {
  children: React.ReactNode;
  stockSlug: string;
}) => {
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
  const [channelId, setChannelId] = useState<number | null>(null);

  useEffect(() => {
    const storedChat = localStorage.getItem('chat');
    const newWorkspaceId = getWorkspaceId(stockSlug);

    if (storedChat) {
      try {
        const chatData = JSON.parse(storedChat);

        if (chatData.workspace !== newWorkspaceId) {
          setWorkspaceId(newWorkspaceId);
          setChannelId(null);
          localStorage.setItem(
            'chat',
            JSON.stringify({ workspace: newWorkspaceId, channelId: null }),
          );
        } else {
          setWorkspaceId(chatData.workspace);
          setChannelId(chatData.channelId);
        }
      } catch (error) {
        console.error('Failed to parse chat data:', error);
        setWorkspaceId(newWorkspaceId);
        setChannelId(null);
      }
    } else {
      setWorkspaceId(newWorkspaceId);
      setChannelId(null);
    }
  }, [stockSlug]);

  const updateChannelId = (channelId: number) => {
    setChannelId(channelId);
    const chatData = { workspace: workspaceId, channelId };
    localStorage.setItem('chat', JSON.stringify(chatData));
  };

  return (
    <ChatContext.Provider
      value={{ workspaceId, channelId, setChannelId: updateChannelId }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatId = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
