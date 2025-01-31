import { Header } from '@/src/shared';
import '@workspace/ui/globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <header className="h-[68px] w-full flex items-center justify-between px-4 py-1 bg-muted">
          <Header />
        </header>
        <div className="flex flex-col h-[calc(100vh-68px)] overflow-hidden">{children}</div>
      </body>
    </html>
  );
}
