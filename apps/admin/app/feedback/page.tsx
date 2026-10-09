'use client';

import { useEffect, useState } from 'react';
import { Button, Card, CardHeader, CardContent, Badge, Table } from '@ticketscan/ui';

interface FeedbackImage {
  id: string;
  ticket_id: string | null;
  user_id: string;
  image_url: string;
  ocr_result: any;
  user_corrections: any;
  selected_for_training: boolean;
  training_job_id: string | null;
  created_at: string;
}

interface TrainingJob {
  id: string;
  model_version: string;
  feedback_percentage: number;
  images_count: number;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  created_at: string;
}

export default function FeedbackPage() {
  const [images, setImages] = useState<FeedbackImage[]>([]);
  const [jobs, setJobs] = useState<TrainingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [feedbackPercentage, setFeedbackPercentage] = useState(100);
  const [creatingJob, setCreatingJob] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        selected: showSelectedOnly.toString(),
      });
      const [imagesRes, jobsRes] = await Promise.all([
        fetch(`/api/admin/feedback?${params}`),
        fetch('/api/admin/ml-training-jobs'),
      ]);
      const imagesData = await imagesRes.json();
      const jobsData = await jobsRes.json();
      setImages(imagesData.images);
      setTotalPages(imagesData.pagination.totalPages);
      setJobs(jobsData || []);
      setSelectedIds([]);
      setSelectAll(false);
    } catch (e) {
      setError('Error al cargar imágenes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page, showSelectedOnly]);

  function toggleSelect(id: string) {
    setSelectedIds(prev => prev.includes(id)
      ? prev.filter(x => x !== id)
      : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(images.map(img => img.id));
    }
    setSelectAll(!selectAll);
  }

  async function bulkUpdateSelection(selected: boolean) {
    if (selectedIds.length === 0) return;
    try {
      setError('');
      setSuccess('');
      const res = await fetch('/api/admin/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_ids: selectedIds, selected_for_training: selected }),
      });
      if (!res.ok) throw new Error('Error al actualizar');
      setSuccess(`${selected ? 'Seleccionadas' : 'Deseleccionadas'} ${selectedIds.length} imágenes`);
      load();
    } catch (e) {
      setError('Error al actualizar selección');
    }
  }

  async function createTrainingJob() {
    if (selectedIds.length === 0) {
      setError('Selecciona al menos una imagen');
      return;
    }
    try {
      setError('');
      setSuccess('');
      setCreatingJob(true);
      const res = await fetch('/api/admin/feedback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback_percentage: feedbackPercentage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear job');
      setSuccess(`Job ${data.job.model_version} creado con ${data.job.images_count} imágenes (${feedbackPercentage}%)`);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreatingJob(false);
    }
  }

  const selectedCount = images.filter(i => i.selected_for_training).length;
  const totalCount = images.length;

  if (loading) return (
    <main className="page-container">
      <div className="page-content">
        <div className="animate-in text-center py-12">
          <div className="loading-spinner"></div>
          <p style={{ color: 'var(--color-500)' }}>Cargando feedback de usuarios...</p>
        </div>
      </div>
    </main>
  );

  const jobStatusVariant = (status: string): 'success' | 'info' | 'danger' | 'muted' => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'info';
      case 'failed': return 'danger';
      default: return 'muted';
    }
  };

  const imageColumns = [
    { key: 'select', header: '', width: '40px', render: () => null },
    { key: 'image', header: 'Imagen', width: '100px', render: () => null },
    { key: 'info', header: 'Info', render: () => null },
    { key: 'ocr', header: 'OCR Original', render: () => null },
    { key: 'corrections', header: 'Correcciones Usuario', render: () => null },
  ];

  const jobColumns = [
    { key: 'model_version', header: 'Versión', render: () => null },
    { key: 'feedback_percentage', header: '% Feedback', render: () => null },
    { key: 'images_count', header: 'Imágenes', render: () => null },
    { key: 'status', header: 'Estado', render: () => null },
    { key: 'created_at', header: 'Creado', render: () => null },
    { key: 'completed_at', header: 'Completado', render: () => null },
  ];

  return (
    <main className="page-container">
      <div className="page-content">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-900)', margin: 0 }}>Pipeline de Reentrenamiento</h1>
          <p style={{ color: 'var(--color-500)', marginTop: '0.25rem' }}>Gestiona imágenes de feedback y crea jobs de entrenamiento</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showSelectedOnly}
              onChange={e => { setShowSelectedOnly(e.target.checked); setPage(1); }}
              style={{ width: '1rem', height: '1rem', borderRadius: '0.375rem', border: '1px solid var(--color-300)', accentColor: 'var(--color-primary)' }}
            />
            <span style={{ fontSize: '0.875rem', color: 'var(--color-700)' }}>Solo seleccionadas para entrenamiento</span>
          </label>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <Card padded style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-primary)', margin: 0 }}>{totalCount}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-500)', margin: 0 }}>Total imágenes</p>
          </Card>
          <Card padded style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-success)', margin: 0 }}>{selectedCount}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-500)', margin: 0 }}>Para entrenamiento</p>
          </Card>
          <Card padded style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-900)', margin: 0 }}>{Math.round(selectedCount / (totalCount || 1) * 100)}%</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-500)', margin: 0 }}>Porcentaje actual</p>
          </Card>
          <Card padded style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-900)', margin: 0 }}>{jobs.length}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-500)', margin: 0 }}>Jobs de entrenamiento</p>
          </Card>
        </div>

        {/* Images Table */}
        <Card padded>
          <CardHeader 
            title={`Imágenes de Feedback (${images.length})`}
            action={
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    style={{ width: '1rem', height: '1rem', borderRadius: '0.375rem', border: '1px solid var(--color-300)', accentColor: 'var(--color-primary)' }}
                  />
                  Seleccionar todo
                </label>
                <Button variant="secondary" size="sm" onClick={() => bulkUpdateSelection(true)} disabled={selectedIds.length === 0}>
                  Marcar seleccionadas
                </Button>
                <Button variant="ghost" size="sm" onClick={() => bulkUpdateSelection(false)} disabled={selectedIds.length === 0} style={{ color: 'var(--color-danger)' }}>
                  Desmarcar
                </Button>
              </div>
            }
          />
          <CardContent>
            {images.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--color-900)', marginBottom: '0.5rem' }}>No hay imágenes de feedback</h3>
                <p style={{ color: 'var(--color-500)' }}>Los usuarios aún no han enviado correcciones de OCR.</p>
              </div>
            ) : (
              <>
                <Table
                  columns={imageColumns.map(col => ({
                    ...col,
                    render: (img: FeedbackImage) => {
                      switch (col.key) {
                        case 'select':
                          return (
                            <input
                              type="checkbox"
                              checked={img.selected_for_training || selectedIds.includes(img.id)}
                              onChange={() => toggleSelect(img.id)}
                              style={{ width: '1rem', height: '1rem', borderRadius: '0.375rem', border: '1px solid var(--color-300)', accentColor: 'var(--color-primary)' }}
                            />
                          );
                        case 'image':
                          return (
                            <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                              <img
                                src={img.image_url}
                                alt="Feedback"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.75rem', border: '1px solid rgba(0, 171, 228, 0.1)' }}
                                loading="lazy"
                              />
                              {img.selected_for_training && (
                                <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: 'var(--color-success)', color: 'white', fontSize: '0.625rem', padding: '0.25rem 0.5rem', borderRadius: '9999px' }}>
                                  ✓ Entrenar
                                </div>
                              )}
                              {img.training_job_id && (
                                <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', backgroundColor: 'var(--color-primary)', color: 'white', fontSize: '0.625rem', padding: '0.25rem 0.5rem', borderRadius: '9999px' }}>
                                  Job asignado
                                </div>
                              )}
                            </div>
                          );
                        case 'info':
                          return (
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: '500', color: 'var(--color-900)' }}>Usuario: {img.user_id.slice(0, 8)}...</span>
                                <span style={{ color: 'var(--color-500)' }}>{new Date(img.created_at).toLocaleString('es-AR')}</span>
                                {img.ticket_id && <span style={{ color: 'var(--color-500)' }}>Ticket: {img.ticket_id.slice(0, 8)}...</span>}
                              </div>
                            </div>
                          );
                        case 'ocr':
                          return (
                            <pre style={{ backgroundColor: 'var(--color-100)', padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.625rem', overflow: 'auto', maxHeight: '128px', color: 'var(--color-700)', fontFamily: 'var(--font-mono)' }}>
                              {JSON.stringify(img.ocr_result, null, 2).slice(0, 300)}
                            </pre>
                          );
                        case 'corrections':
                          return (
                            <pre style={{ backgroundColor: 'rgba(4, 120, 87, 0.08)', padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.625rem', overflow: 'auto', maxHeight: '128px', color: '#047857', fontFamily: 'var(--font-mono)' }}>
                              {JSON.stringify(img.user_corrections, null, 2).slice(0, 300)}
                            </pre>
                          );
                      }
                    }
                  }))}
                  data={images}
                  keyExtractor={img => img.id}
                />
                {totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0, 171, 228, 0.08)' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-500)' }}>Página {page} de {totalPages}</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                        Anterior
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Training Config */}
        <Card padded style={{ marginTop: '1.5rem' }}>
          <CardHeader title="Crear Job de Entrenamiento" />
          <CardContent>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '280px' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-700)' }}>% para reentrenar:</span>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={feedbackPercentage}
                  onChange={e => setFeedbackPercentage(Number(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--color-primary)' }}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-primary)', minWidth: '3rem', textAlign: 'right' }}>{feedbackPercentage}%</span>
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-500)' }}>
                Usar {Math.round(selectedCount * feedbackPercentage / 100)} de {selectedCount} imágenes seleccionadas
              </span>
              <Button variant="primary" onClick={createTrainingJob} disabled={creatingJob || selectedCount === 0}>
                {creatingJob ? 'Creando job...' : 'Crear Job de Entrenamiento'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Training Jobs History */}
        <Card padded style={{ marginTop: '1.5rem' }}>
          <CardHeader title="Historial de Jobs de Entrenamiento" />
          <CardContent>
            {jobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-500)' }}>
                No hay jobs de entrenamiento creados aún
              </div>
            ) : (
              <Table
                columns={jobColumns.map(col => ({
                  ...col,
                  render: (job: TrainingJob) => {
                    switch (col.key) {
                      case 'model_version':
                        return <code style={{ fontSize: '0.8125rem', color: 'var(--color-900)' }}>{job.model_version}</code>;
                      case 'feedback_percentage':
                        return <span style={{ fontSize: '0.875rem', color: 'var(--color-700)' }}>{job.feedback_percentage}%</span>;
                      case 'images_count':
                        return <span style={{ fontSize: '0.875rem', color: 'var(--color-700)' }}>{job.images_count}</span>;
                      case 'status':
                        return <Badge variant={jobStatusVariant(job.status)} dot>{job.status}</Badge>;
                      case 'created_at':
                        return <span style={{ fontSize: '0.875rem', color: 'var(--color-600)' }}>{new Date(job.created_at).toLocaleString('es-AR')}</span>;
                      case 'completed_at':
                        return <span style={{ fontSize: '0.875rem', color: 'var(--color-600)' }}>{job.completed_at ? new Date(job.completed_at).toLocaleString('es-AR') : '—'}</span>;
                    }
                  }
                }))}
                data={jobs}
                keyExtractor={job => job.id}
              />
            )}
          </CardContent>
        </Card>

        {error && <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(185, 28, 28, 0.1)', color: '#B91C1C', fontSize: '0.875rem' }}>{error}</div>}
        {success && <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(4, 120, 87, 0.1)', color: '#047857', fontSize: '0.875rem' }}>{success}</div>}
      </div>
    </main>
  );
}