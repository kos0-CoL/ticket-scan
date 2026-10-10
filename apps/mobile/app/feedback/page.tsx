'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, Button, Badge, Table } from '@ticketscan/ui';
import type { Column, FeedbackImage, FeedbackListResponse } from '../../lib/api';
import { getFeedback, updateFeedback } from '../../lib/api';
import FeedbackCorrectionModal from '../components/FeedbackCorrectionModal';

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<FeedbackImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<'all' | 'selected' | 'pending'>('all');
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackImage | null>(null);

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: FeedbackListResponse = await getFeedback({ page, limit: 20, status });
      if (response.ok) {
        setFeedbackList(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        setError(response.error || 'Error al cargar feedback');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [page, status]);

  const handleOpenCorrection = (feedback: FeedbackImage) => {
    setSelectedFeedback(feedback);
    setCorrectionModalOpen(true);
  };

  const handleSaveCorrection = async (
    feedbackId: string,
    corrections: Record<string, unknown>,
    selectedForTraining: boolean
  ) => {
    const response = await updateFeedback(feedbackId, {
      user_corrections: corrections,
      selected_for_training: selectedForTraining,
    });
    if (!response.ok) {
      throw new Error(response.error || 'Error al actualizar');
    }
    fetchFeedback();
  };

  const columns: Column<FeedbackImage>[] = [
    { key: 'created_at', header: 'Fecha', render: (f: FeedbackImage) => <span>{new Date(f.created_at).toLocaleDateString()}</span> },
    { key: 'ticket_id', header: 'Ticket', render: (f: FeedbackImage) => <span className="font-mono text-xs">{f.ticket_id.slice(0, 8)}...</span> },
    { key: 'status', header: 'Estado', render: (f: FeedbackImage) => <Badge variant={f.selected_for_training ? 'success' : 'warning'}>{f.selected_for_training ? 'Para entrenamiento' : 'Pendiente'}</Badge> },
    {
      key: 'actions',
      header: 'Acciones',
      render: (f: FeedbackImage) => (
        <Button variant="ghost" size="sm" onClick={() => handleOpenCorrection(f)}>
          Corregir
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Feedback de OCR</h1>
      </div>

      <div className="flex gap-2">
        {(['all', 'pending', 'selected'] as const).map((s) => (
          <Button
            key={s}
            variant={status === s ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => { setStatus(s); setPage(1); }}
          >
            {s === 'all' ? 'Todos' : s === 'pending' ? 'Pendientes' : 'Para entrenamiento'}
          </Button>
        ))}
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
            data={feedbackList}
            keyExtractor={(f) => f.id}
            hover
            divide
            emptyMessage={status === 'selected' ? 'Ningún feedback marcado para entrenamiento' : 'Sin feedback de OCR aún'}
            loading={loading}
          />
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-slate-600">Página {page} de {totalPages}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}

      {selectedFeedback && (
        <FeedbackCorrectionModal
          feedback={selectedFeedback}
          open={correctionModalOpen}
          onClose={() => { setCorrectionModalOpen(false); setSelectedFeedback(null); }}
          onSave={handleSaveCorrection}
        />
      )}
    </div>
  );
}