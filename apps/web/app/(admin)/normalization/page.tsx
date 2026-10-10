'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent, Table, Button, Badge, StatusBadge, Modal, Select } from '@ticketscan/ui';
import type { Column } from '@ticketscan/ui';

interface NormalizationItem {
  id: string;
  ticket_id: string;
  comercio: string;
  fecha: string;
  total: number;
  suggested_category: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const mockQueue: NormalizationItem[] = [
  { id: '1', ticket_id: 't1', comercio: 'Carrefour', fecha: '2025-01-15', total: 45230, suggested_category: 'almacen', status: 'pending', created_at: '2025-01-15T10:30:00Z' },
  { id: '2', ticket_id: 't2', comercio: 'Dia', fecha: '2025-01-15', total: 23100, suggested_category: 'frescos', status: 'pending', created_at: '2025-01-15T11:15:00Z' },
  { id: '3', ticket_id: 't3', comercio: 'Coto', fecha: '2025-01-14', total: 67890, suggested_category: 'bebidas', status: 'approved', created_at: '2025-01-14T09:00:00Z' },
  { id: '4', ticket_id: 't4', comercio: 'ChangoMas', fecha: '2025-01-14', total: 12450, suggested_category: 'limpieza', status: 'rejected', created_at: '2025-01-14T14:20:00Z' },
];

export default function NormalizationPage() {
  const [queue, setQueue] = useState<NormalizationItem[]>(mockQueue);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [detailModal, setDetailModal] = useState<NormalizationItem | null>(null);

  const filteredQueue = filterStatus === 'all' ? queue : queue.filter(q => q.status === filterStatus);

  const columns: Column<NormalizationItem>[] = [
    { key: 'comercio', header: 'Comercio', render: (q) => <span className="font-medium">{q.comercio}</span> },
    { key: 'fecha', header: 'Fecha', render: (q) => <span>{q.fecha}</span> },
    { key: 'total', header: 'Total', render: (q) => <span className="font-mono">${q.total.toLocaleString()}</span> },
    { key: 'suggested_category', header: 'Categoría sugerida', render: (q) => <Badge variant="primary">{q.suggested_category}</Badge> },
    { key: 'status', header: 'Estado', render: (q) => <StatusBadge status={q.status === 'approved' ? 'success' : q.status === 'rejected' ? 'error' : 'pending'} /> },
    { key: 'actions', header: 'Acciones', render: (q) => (
      <div className="flex gap-1">
        {q.status === 'pending' && (
          <>
            <Button variant="primary" size="sm" onClick={() => handleApprove(q.id)}>Aprobar</Button>
            <Button variant="danger" size="sm" onClick={() => handleReject(q.id)}>Rechazar</Button>
          </>
        )}
        <Button variant="ghost" size="sm" onClick={() => setDetailModal(q)}>Ver</Button>
      </div>
    )},
  ];

  const handleApprove = (id: string) => {
    setQueue(queue.map(q => q.id === id ? { ...q, status: 'approved' } : q));
  };

  const handleReject = (id: string) => {
    setQueue(queue.map(q => q.id === id ? { ...q, status: 'rejected' } : q));
  };

  const stats = {
    pending: queue.filter(q => q.status === 'pending').length,
    approved: queue.filter(q => q.status === 'approved').length,
    rejected: queue.filter(q => q.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Normalización de tickets</h1>
          <p className="text-slate-500">Revisa y aprueba las categorizaciones sugeridas por IA</p>
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} options={[
            { value: 'all', label: 'Todos' },
            { value: 'pending', label: 'Pendientes' },
            { value: 'approved', label: 'Aprobados' },
            { value: 'rejected', label: 'Rechazados' },
          ]} className="w-40" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card elevated padded>
          <CardHeader title="Pendientes" subtitle={String(stats.pending)} />
        </Card>
        <Card elevated padded>
          <CardHeader title="Aprobados" subtitle={String(stats.approved)} />
        </Card>
        <Card elevated padded>
          <CardHeader title="Rechazados" subtitle={String(stats.rejected)} />
        </Card>
      </div>

      <Card elevated>
        <Table columns={columns} data={filteredQueue} keyExtractor={q => q.id} hover divide emptyMessage="No hay items en la cola" />
      </Card>

      <Modal open={!!detailModal} onClose={() => setDetailModal(null)} title="Detalle del ticket" size="md">
        {detailModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500">Comercio:</span> <span className="font-medium ml-2">{detailModal.comercio}</span></div>
              <div><span className="text-slate-500">Fecha:</span> <span className="font-medium ml-2">{detailModal.fecha}</span></div>
              <div><span className="text-slate-500">Total:</span> <span className="font-medium ml-2 font-mono">${detailModal.total.toLocaleString()}</span></div>
              <div><span className="text-slate-500">Categoría:</span> <span className="font-medium ml-2">{detailModal.suggested_category}</span></div>
              <div><span className="text-slate-500">Estado:</span> <StatusBadge status={detailModal.status === 'approved' ? 'success' : detailModal.status === 'rejected' ? 'error' : 'pending'} /></div>
              <div><span className="text-slate-500">Ticket ID:</span> <span className="font-medium ml-2 font-mono">{detailModal.ticket_id}</span></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}