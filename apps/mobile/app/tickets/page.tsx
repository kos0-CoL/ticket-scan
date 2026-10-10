'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, Button, Badge, Modal, Table } from '@ticketscan/ui';
import type { Column } from '@ticketscan/ui';
import { getTickets, createTicket, Ticket, TicketItem, CreateTicketInput } from '../../lib/api';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const columns: Column<Ticket>[] = [
    { key: 'comercio', header: 'Comercio', render: (t) => <span className="font-medium">{t.comercio}</span> },
    { key: 'fecha', header: 'Fecha', render: (t) => <span>{t.fecha}</span> },
    { key: 'items_count', header: 'Items', render: (t) => <span className="text-slate-500">{t.ticket_items?.length || 0}</span> },
    { key: 'total', header: 'Total', render: (t) => <span className="font-mono font-semibold">${t.total.toLocaleString()}</span> },
    {
      key: 'actions',
      header: 'Acciones',
      render: (t) => (
        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(t.id)}>
          Ver
        </Button>
      ),
    },
  ];

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTickets({ page, limit: 20 });
      if (response.ok) {
        setTickets(response.data);
        setTotalPages(response.pagination.totalPages);
      } else {
        setError(response.error || 'Error al cargar tickets');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page]);

  const handleViewDetail = async (id: string) => {
    // Navegar a detalle o abrir modal
    console.log('Ver ticket:', id);
  };

  const handleCreateTicket = async (input: CreateTicketInput) => {
    const response = await createTicket(input);
    if (response.ok) {
      setIsModalOpen(false);
      fetchTickets();
    } else {
      setError(response.error || 'Error al crear ticket');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Mis Tickets</h1>
        <Button variant="float" size="lg" onClick={() => setScanModalOpen(true)}>
          <span>📷</span> Escanear
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <Card elevated>
        <CardContent>
          <Table
            columns={columns}
            data={tickets.map(t => ({ ...t, items_count: t.ticket_items?.length || 0 }))}
            keyExtractor={t => t.id}
            hover
            divide
            emptyMessage="No tienes tickets aún. ¡Escanea tu primero!"
            loading={loading}
          />
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-slate-600">Página {page} de {totalPages}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}

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