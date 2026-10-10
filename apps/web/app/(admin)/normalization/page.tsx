'use client';

import { useState, useEffect } from 'react';
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
  tickets?: { comercio: string; fecha: string; total: number };
}

interface PaginatedResponse<T> {
  ok: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function NormalizationPage() {
  const [queue, setQueue] = useState<NormalizationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [detailModal, setDetailModal] = useState<NormalizationItem | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (filterStatus !== 'all') params.set('status', filterStatus);

      const res = await fetch(`/api/admin/normalization?${params}`);
      const result: PaginatedResponse<NormalizationItem> = await res.json();
      if (result.ok) {
        setQueue(result.data);
        setTotalPages(result.pagination.totalPages);
      }
    } catch (err) {
      console.error('Error fetching normalization queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [page, filterStatus]);

  const columns: Column<NormalizationItem>[] = [
    { key: 'comercio', header: 'Comercio', render: (q) => <span className="font-medium">{q.tickets?.comercio || q.comercio}</span> },
    { key: 'fecha', header: 'Fecha', render: (q) => <span>{q.tickets?.fecha || q.fecha}</span> },
    { key: 'total', header: 'Total', render: (q) => <span className="font-mono">${(q.tickets?.total || q.total).toLocaleString()}</span> },
    { key: 'suggested_category', header: 'Categoría sugerida', render: (q) => <Badge variant="primary">{q.suggested_category}</Badge> },
    { key: 'status', header: 'Estado', render: (q) => <StatusBadge status={q.status === 'approved' ? 'success' : q.status === 'rejected' ? 'error' : 'pending'} /> },
    { key: 'actions', header: 'Acciones', render: (q) => (
      <div className="flex gap-1">
        {q.status === 'pending' && (
          <>
            <Button variant="primary" size="sm" onClick={() => handleUpdate(q.id, 'approved')}>Aprobar</Button>
            <Button variant="danger" size="sm" onClick={() => handleUpdate(q.id, 'rejected')}>Rechazar</Button>
          </>
        )}
        <Button variant="ghost" size="sm" onClick={() => setDetailModal(q)}>Ver</Button>
      </div>
    )},
  ];

  const handleUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/admin/normalization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const result = await res.json();
      if (result.ok) {
        await fetchQueue();
      } else {
        alert(result.error || 'Error al actualizar');
      }
    } catch (err) {
      alert('Error de conexión');
    }
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

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <Card elevated>
          <Table columns={columns} data={queue} keyExtractor={q => q.id} hover divide emptyMessage="No hay items en la cola" />
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
          <span className="text-sm text-slate-600">Página {page} de {totalPages}</span>
          <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Siguiente</Button>
        </div>
      )}

      <Modal open={!!detailModal} onClose={() => setDetailModal(null)} title="Detalle del ticket" size="md">
        {detailModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500">Comercio:</span> <span className="font-medium ml-2">{detailModal.tickets?.comercio || detailModal.comercio}</span></div>
              <div><span className="text-slate-500">Fecha:</span> <span className="font-medium ml-2">{detailModal.tickets?.fecha || detailModal.fecha}</span></div>
              <div><span className="text-slate-500">Total:</span> <span className="font-medium ml-2 font-mono">${(detailModal.tickets?.total || detailModal.total).toLocaleString()}</span></div>
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