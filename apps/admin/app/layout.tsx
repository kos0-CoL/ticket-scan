import './globals.css';
import { supabaseServer } from '../lib/supabase-server';
import { redirect } from 'next/navigation';

export const metadata = { title: 'TicketScan Admin', description: 'Panel de administración' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect('/login');

  return (
    <html lang="es">
      <body className="bg-gray-50">
        <nav className="bg-blue-600 text-white p-4 flex gap-6">
          <a href="/providers" className="hover:underline">Proveedores</a>
          <a href="/monitoring" className="hover:underline">Monitorización</a>
          <a href="/normalization" className="hover:underline">Normalización</a>
          <a href="/users" className="hover:underline">Usuarios</a>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
