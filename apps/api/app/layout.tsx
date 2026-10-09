import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'TicketScan API',
  description: 'API de TicketScan — tickets, análisis y administración.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="page-container">
        {children}
      </body>
    </html>
  );
}
