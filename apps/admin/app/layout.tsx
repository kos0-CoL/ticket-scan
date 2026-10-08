import './globals.css';
import { supabaseServer } from '../lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = { title: 'TicketScan Admin', description: 'Panel de administración' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect('/login');

  const navItems = [
    { href: '/providers', label: 'Proveedores IA', icon: '🤖' },
    { href: '/monitoring', label: 'Monitorización', icon: '📊' },
    { href: '/normalization', label: 'Normalización', icon: '🔧' },
    { href: '/users', label: 'Usuarios', icon: '👥' },
  ];

  return (
    <html lang="es">
      <body className="page-container">
        <header className="sticky top-0 z-40 glass shadow-card">
          <nav className="max-w-7xl mx-auto px-4" aria-label="Navegación principal">
            <div className="flex h-16 items-center justify-between">
              <Link href="/providers" className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <span className="text-2xl">🎫</span> TicketScan Admin
              </Link>
              <div className="flex items-center gap-1">
                {navItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-primary-light hover:text-primary hover:shadow-card"
                  >
                    <span aria-hidden="true">{item.icon}</span> {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </header>
        <main className="page-content">{children}</main>
      </body>
    </html>
  );
}
