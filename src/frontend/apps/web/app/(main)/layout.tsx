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
        <div className="flex flex-col overflow-hidden bg-muted">{children}</div>
      </body>
    </html>
  );
}
