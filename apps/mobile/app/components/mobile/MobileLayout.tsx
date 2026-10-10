'use client';

import { TabBar, TabBarSpacer } from '@ticketscan/ui';
import { usePathname } from 'next/navigation';

const mobileTabs = [
  { href: '/tickets', label: 'Tickets', icon: '🧾' },
  { href: '/analysis', label: 'Análisis', icon: '📊' },
  { href: '/feedback', label: 'Feedback', icon: '🔧' },
  { href: '/settings', label: 'Configuración', icon: '⚙️' },
];

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white">
      <main className="pb-safe pt-4 px-4">
        {children}
      </main>

      <TabBar items={mobileTabs} pathname={pathname} hideOnPaths={['/login', '/register']} />

      <TabBarSpacer />
    </div>
  );
}