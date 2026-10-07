'use client';
import Link from 'next/link';

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="flex gap-2 p-2 bg-white border-b">
        <Link href="/tickets" className="px-3 py-2 text-sm">Tickets</Link>
        <Link href="/analisis" className="px-3 py-2 text-sm">Análisis</Link>
        <Link href="/config" className="px-3 py-2 text-sm">Config</Link>
      </nav>
      <div>{children}</div>
    </>
  );
}