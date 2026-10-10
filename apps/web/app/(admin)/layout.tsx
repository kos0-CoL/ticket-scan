import { Metadata } from 'next';
import { AdminLayout } from '../components/admin/AdminLayout';

export const metadata: Metadata = {
  title: 'TicketScan Admin',
  description: 'Panel de administración de TicketScan',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}