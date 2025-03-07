import '@workspace/ui/globals.css';

import { ToastAlarm } from '@/src/features/alarm';
import AuthWrapper from '@/src/features/auth/ui/auth-wrapper';
// import { getAccessToken } from '@/src/features/stock';
import { ProfilePopover } from '@/src/features/user';

import { Header, StompWebSocketProvider, RQProvider } from '@/src/shared';
import { getUserIdFromCookie } from '@/src/shared/services/lib';
import { Toaster } from '@workspace/ui/components';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = await getUserIdFromCookie();
  // const token = await getAccessToken();
  return (
    <>
      <header className="h-[68px] w-full flex items-center justify-between px-4 py-1 bg-muted">
        <Header authContent={<ProfilePopover />} />
      </header>
      <div className="flex flex-col h-[calc(100vh-68px)] overflow-hidden">
        <AuthWrapper>
          <RQProvider>
            <StompWebSocketProvider userId={userId}>
              {children}
            </StompWebSocketProvider>
          </RQProvider>
          <Toaster />
          <ToastAlarm />
        </AuthWrapper>
      </div>
    </>
  );
}
