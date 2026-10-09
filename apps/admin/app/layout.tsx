import './globals.css';
import { TabBar, TabBarSpacer } from '@ticketscan/ui';

export const metadata = { title: 'TicketScan Admin', description: 'Panel de administración' };

const navItems = [
  { href: '/providers', label: 'Proveedores IA', icon: '🤖' },
  { href: '/monitoring', label: 'Monitorización', icon: '📊' },
  { href: '/normalization', label: 'Normalización', icon: '🔧' },
  { href: '/landing', label: 'Landing', icon: '🛬' },
  { href: '/users', label: 'Usuarios', icon: '👥' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="page-container">
        <TabBar items={navItems} hideOnPaths={['/login']} />
        <TabBarSpacer />
        <main className="page-content">{children}</main>
      </body>
    </html>
  );
}