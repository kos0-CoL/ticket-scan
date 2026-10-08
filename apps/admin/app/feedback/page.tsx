'use client';

import { useEffect, useState } from 'react';

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
      // Reset selection on page change
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
      // Load jobs from separate endpoint would be better, but for now refresh
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreatingJob(false);
    }
  }

  const selectedCount = images.filter(i => i.selected_for_training).length;
  const totalCount = images.length;

  if (loading) {
    return (
      <main className="page-container">
        <div className="page-content">
          <div className="animate-in text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando feedback de usuarios...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container">
      <div className="page-content">
        <div className="flex items-center justify-between mb-8 animate-in">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pipeline de Reentrenamiento</h1>
            <p className="text-slate-600 mt-1">Gestiona imágenes de feedback y crea jobs de entrenamiento</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showSelectedOnly}
              onChange={e => { setShowSelectedOnly(e.target.checked); setPage(1); }}
              className="rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-slate-700">Solo seleccionadas para entrenamiento</span>
          </label>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-in">
          <div className="card-padded text-center">
            <p className="text-3xl font-bold text-primary">{totalCount}</p>
            <p className="text-sm text-slate-600">Total imágenes</p>
          </div>
          <div className="card-padded text-center">
            <p className="text-3xl font-bold text-green-600">{selectedCount}</p>
            <p className="text-sm text-slate-600">Para entrenamiento</p>
          </div>
          <div className="card-padded text-center">
            <p className="text-3xl font-bold text-slate-900">{Math.round(selectedCount / (totalCount || 1) * 100)}%</p>
            <p className="text-sm text-slate-600">Porcentaje actual</p>
          </div>
          <div className="card-padded text-center">
            <p className="text-3xl font-bold text-slate-900">{jobs.length}</p>
            <p className="text-sm text-slate-600">Jobs de entrenamiento</p>
          </div>
        </div>

        {/* Images Grid */}
        <div className="card animate-in">
          <div className="p-4 border-b border-primary-light/50 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Imágenes de Feedback ({images.length})</h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-700">Seleccionar todo</span>
              </label>
              <div className="flex gap-2">
                <button onClick={() => bulkUpdateSelection(true)} className="btn-secondary text-sm px-3 py-1.5" disabled={selectedIds.length === 0}>
                  Marcar seleccionadas
                </button>
                <button onClick={() => bulkUpdateSelection(false)} className="btn-ghost text-sm px-3 py-1.5 text-red-600 hover:bg-red-50" disabled={selectedIds.length === 0}>
                  Desmarcar seleccionadas
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-primary-light/50 bg-slate-50">
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-2">
                <span className="text-sm text-slate-700">% para reentrenar:</span>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={feedbackPercentage}
                  onChange={e => setFeedbackPercentage(Number(e.target.value))}
                  className="w-48 h-2 bg-primary-light rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-sm font-medium text-primary w-10 text-right">{feedbackPercentage}%</span>
              </label>
              <span className="text-xs text-slate-500">
                Usar {Math.round(selectedCount * feedbackPercentage / 100)} de {selectedCount} imágenes seleccionadas
              </span>
              <button
                onClick={createTrainingJob}
                disabled={creatingJob || selectedCount === 0}
                className="btn-primary ml-auto"
              >
                {creatingJob ? 'Creando job...' : 'Crear Job de Entrenamiento'}
              </button>
            </div>
          </div>

          <div className="divide-y divide-primary-light/50">
            {images.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4">📷</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay imágenes de feedback</h3>
                <p className="text-slate-600">Los usuarios aún no han enviado correcciones de OCR.</p>
              </div>
            ) : (
              images.map(img => (
                <div key={img.id} className="p-4 flex items-start gap-4 hover:bg-primary-light/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={img.selected_for_training || selectedIds.includes(img.id)}
                    onChange={() => toggleSelect(img.id)}
                    className="mt-1 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <img
                      src={img.image_url}
                      alt="Feedback"
                      className="w-full h-full object-cover rounded-xl border border-primary-light/50"
                      loading="lazy"
                    />
                    {img.selected_for_training && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        ✓ Entrenar
                      </div>
                    )}
                    {img.training_job_id && (
                      <div className="absolute bottom-2 left-2 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
                        Job asignado
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-medium text-slate-900">Usuario: {img.user_id.slice(0, 8)}...</span>
                      <span className="text-slate-500">{new Date(img.created_at).toLocaleString('es-AR')}</span>
                      {img.ticket_id && (
                        <span className="text-slate-500">Ticket: {img.ticket_id.slice(0, 8)}...</span>
                      )}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">OCR Original</p>
                        <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto max-h-32 text-slate-700 font-mono">
                          {JSON.stringify(img.ocr_result, null, 2).slice(0, 200)}
                        </pre>
                      </div>
                      <div>
                        <p className="text-slate-500">Correcciones Usuario</p>
                        <pre className="bg-green-50 p-2 rounded text-xs overflow-auto max-h-32 text-green-900 font-mono">
                          {JSON.stringify(img.user_corrections, null, 2).slice(0, 200)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">Página {page} de {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-ghost text-sm px-3 py-1.5"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-ghost text-sm px-3 py-1.5"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Training Jobs History */}
        <div className="mt-10 animate-in" style={{ animationDelay: "200ms" }}>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Historial de Jobs de Entrenamiento</h2>
          <div className="card overflow-hidden">
            {jobs.length === 0 ? (
              <div className="card-padded text-center py-8">
                <p className="text-slate-500">No hay jobs de entrenamiento creados aún</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-surface border-b border-primary-light/50">
                    <th className="p-4 text-left text-sm font-semibold text-slate-700">Versión</th>
                    <th className="p-4 text-left text-sm font-semibold text-slate-700">% Feedback</th>
                    <th className="p-4 text-left text-sm font-semibold text-slate-700">Imágenes</th>
                    <th className="p-4 text-left text-sm font-semibold text-slate-700">Estado</th>
                    <th className="p-4 text-left text-sm font-semibold text-slate-700">Creado</th>
                    <th className="p-4 text-left text-sm font-semibold text-slate-700">Completado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-light/50">
                  {jobs.map(job => (
                    <tr key={job.id} className="hover:bg-primary-light/20">
                      <td className="p-4 font-mono text-sm text-slate-900">{job.model_version}</td>
                      <td className="p-4 text-sm text-slate-700">{job.feedback_percentage}%</td>
                      <td className="p-4 text-sm text-slate-700">{job.images_count}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          job.status === 'completed' ? 'bg-green-100 text-green-700' :
                          job.status === 'running' ? 'bg-blue-100 text-blue-700' :
                          job.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {job.status === 'completed' && '●'} {job.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600">{new Date(job.created_at).toLocaleString('es-AR')}</td>
                      <td className="p-4 text-sm text-slate-600">
                        {job.completed_at ? new Date(job.completed_at).toLocaleString('es-AR') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {error && <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm animate-in">{error}</div>}
        {success && <div className="mt-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm animate-in">{success}</div>}
      </div>
    </main>
  );
}