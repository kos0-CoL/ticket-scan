import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'TicketScan API',
  description: 'API de TicketScan — tickets, análisis y administración.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111' }}>
        {children}
      </body>
    </html>
  );
}
