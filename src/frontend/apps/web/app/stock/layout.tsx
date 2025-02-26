import AuthWrapper from '@/src/features/auth/ui/auth-wrapper';
import { getAccessToken } from '@/src/features/stock';
import { ProfilePopover } from '@/src/features/user';
import {
  Header,
  StompWebSocketProvider,
  RQProvider,
  WebSocketProvider,
} from '@/src/shared';

import '@workspace/ui/globals.css';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getAccessToken();
  return (
    <>
      <header className="h-[68px] w-full flex items-center justify-between px-4 py-1 bg-muted">
        <Header authContent={<ProfilePopover />} />
      </header>
      <div className="flex flex-col h-[calc(100vh-68px)] overflow-hidden">
        <AuthWrapper>
          <StompWebSocketProvider userId={1}>
            <RQProvider>
              <WebSocketProvider token={token}>{children}</WebSocketProvider>
            </RQProvider>
          </StompWebSocketProvider>
        </AuthWrapper>
      </div>
    </>
  );
}
