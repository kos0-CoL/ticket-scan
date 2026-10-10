import { Metadata } from 'next';
import { MobileLayout } from './components/mobile/MobileLayout';

export const metadata: Metadata = {
  title: 'TicketScan - Tu app de tickets',
  description: 'Escanea, categoriza y analiza tus tickets de supermercado',
};

export default function MobileRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#00ABE4" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TicketScan" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen bg-white font-sans antialiased pb-safe">
        {children}
      </body>
    </html>
  );
}