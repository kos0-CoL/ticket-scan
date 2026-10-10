'use client';

import { TabBar, TabBarSpacer } from '@ticketscan/ui';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const adminTabs = [
  { href: '/admin', label: 'Proveedores IA', icon: '🤖' },
  { href: '/admin/monitoring', label: 'Monitorización', icon: '📊' },
  { href: '/admin/normalization', label: 'Normalización', icon: '🔧' },
  { href: '/admin/landing', label: 'Landing', icon: '🎯' },
  { href: '/admin/users', label: 'Usuarios', icon: '👥' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="pb-24 md:pb-0 pt-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      <TabBar items={adminTabs} pathname={pathname} hideOnPaths={['/admin/login']} />

      <TabBarSpacer />
    </div>
  );
}