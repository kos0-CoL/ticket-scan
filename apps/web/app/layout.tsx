export const metadata = {
  title: 'TicketScan - Escanea tus tickets de supermercado',
  description: 'La app que escanea, categoriza y analiza tus compras de supermercado automáticamente. Disponible para Android.',
  openGraph: {
    title: 'TicketScan - Tu asistente de compras inteligente',
    description: 'Escanea tickets, categoriza gastos y controla tu presupuesto',
    type: 'website',
  },
};

export default async function RootLayout({
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
      </head>
      <body className="min-h-screen bg-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}