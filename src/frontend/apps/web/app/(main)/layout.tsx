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
        <header className="h-[68px] bg-gray-800 flex items-center justify-center">Header</header>
        <div className="flex flex-col h-[calc(100vh-68px)] overflow-hidden">{children}</div>
      </body>
    </html>
  );
}
