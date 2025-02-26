import { ToastAlarm } from '@/src/features/alarm';
import AuthWrapper from '@/src/features/auth/ui/auth-wrapper';
import { ProfilePopover } from '@/src/features/user';
import { Header, StompWebSocketProvider, RQProvider } from '@/src/shared';
import { getUserIdFromCookie } from '@/src/shared/services/lib';
import { Toaster } from '@workspace/ui/components';

import '@workspace/ui/globals.css';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = await getUserIdFromCookie();
  return (
    <>
      <header className="h-[68px] w-full flex items-center justify-between px-4 py-1 bg-muted">
        <Header authContent={<ProfilePopover />} />
      </header>
      <div className="flex flex-col h-[calc(100vh-68px)] overflow-hidden">
        <AuthWrapper>
          <StompWebSocketProvider userId={userId}>
            <RQProvider>{children}</RQProvider>
          </StompWebSocketProvider>
          <Toaster />
          <ToastAlarm />
        </AuthWrapper>
      </div>
    </>
  );
}
