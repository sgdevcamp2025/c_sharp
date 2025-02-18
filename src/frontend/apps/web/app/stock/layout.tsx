import AuthWrapper from '@/src/features/auth/ui/auth-wrapper';
import { ProfilePopover } from '@/src/features/user';
import { Header } from '@/src/shared';
import { StompWebSocketProvider } from '@/src/shared/components/providers';
import '@workspace/ui/globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="h-[68px] w-full flex items-center justify-between px-4 py-1 bg-muted">
        <Header authContent={<ProfilePopover />} />
      </header>
      <div className="flex flex-col h-[calc(100vh-68px)] overflow-hidden">
        <AuthWrapper>
          <StompWebSocketProvider
            serverType="chat1"
            userId={1}
          >
            {children}
          </StompWebSocketProvider>
        </AuthWrapper>
      </div>
    </>
  );
}
