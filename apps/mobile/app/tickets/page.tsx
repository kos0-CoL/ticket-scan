'use client';

import { useState } from 'react';
import { Card, CardContent, Button, Input, Badge, Modal, Table } from '@ticketscan/ui';
import type { Column } from '@ticketscan/ui';

interface Ticket {
  id: string;
  comercio: string;
  fecha: string;
  total: number;
  items: number;
}

const mockTickets: Ticket[] = [
  { id: '1', comercio: 'Carrefour', fecha: '2025-01-15', total: 45230, items: 12 },
  { id: '2', comercio: 'Dia', fecha: '2025-01-14', total: 23100, items: 8 },
  { id: '3', comercio: 'Coto', fecha: '2025-01-13', total: 67890, items: 15 },
  { id: '4', comercio: 'ChangoMas', fecha: '2025-01-12', total: 12450, items: 5 },
];

export default function TicketsPage() {
  const [tickets] = useState<Ticket[]>(mockTickets);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);

  const columns: Column<Ticket>[] = [
    { key: 'comercio', header: 'Comercio', render: (t) => <span className="font-medium">{t.comercio}</span> },
    { key: 'fecha', header: 'Fecha', render: (t) => <span>{t.fecha}</span> },
    { key: 'items', header: 'Items', render: (t) => <span className="text-slate-500">{t.items}</span> },
    { key: 'total', header: 'Total', render: (t) => <span className="font-mono font-semibold">${t.total.toLocaleString()}</span> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Mis Tickets</h1>
        <Button variant="float" size="lg" onClick={() => setScanModalOpen(true)}>
          <span>📷</span> Escanear
        </Button>
      </div>

      <Card elevated>
        <CardContent>
          <Table columns={columns} data={tickets} keyExtractor={t => t.id} hover divide emptyMessage="No tienes tickets aún. ¡Escanea tu primero!" />
        </CardContent>
      </Card>

      <Modal open={scanModalOpen} onClose={() => setScanModalOpen(false)} title="Escanear ticket" size="md">
        <div className="space-y-4 text-center">
          <div className="w-48 h-48 mx-auto rounded-2xl bg-primary-light flex items-center justify-center">
            <span className="text-6xl">📷</span>
          </div>
          <p className="text-slate-600">La cámara se abrirá para escanear tu ticket</p>
          <Button onClick={() => setScanModalOpen(false)} variant="primary" fullWidth>Entendido</Button>
        </div>
      </Modal>
    </div>
  );
}