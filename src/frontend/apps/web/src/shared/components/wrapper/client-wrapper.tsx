'use client';

import { StompWebSocketProvider } from '@/src/shared/components/providers';

const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StompWebSocketProvider
      serverType="chat1"
      userId={1}
    >
      {children}
    </StompWebSocketProvider>
  );
};

export default ClientWrapper;
