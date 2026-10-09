import './globals.css';
import Link from 'next/link';

export const metadata = { title: 'TicketScan Admin', description: 'Panel de administración' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // La protección de sesión vive en middleware.ts (excluye /login del
  // matcher). Este layout NUNCA debe redirigir: hacerlo en /login causaba
  // un bucle infinito (redirect('/login') dentro del render de /login).
  // El middleware garantiza que solo usuarios con sesión llegan aquí,
  // salvo a /login y a las rutas excluidas.

  const navItems = [
    { href: '/providers', label: 'Proveedores IA', icon: '🤖' },
    { href: '/monitoring', label: 'Monitorización', icon: '📊' },
    { href: '/normalization', label: 'Normalización', icon: '🔧' },
    { href: '/landing', label: 'Landing', icon: '🛬' },
    { href: '/users', label: 'Usuarios', icon: '👥' },
  ];

  return (
    <html lang="es">
      <body className="page-container">
        <header className="admin-nav">
          <nav aria-label="Navegación principal" className="nav-inner">
            <div className="nav-row">
              <Link href="/providers" className="nav-brand">
                <span aria-hidden="true">🎫</span> TicketScan Admin
              </Link>
              <div className="nav-links">
                {navItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="nav-link"
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
