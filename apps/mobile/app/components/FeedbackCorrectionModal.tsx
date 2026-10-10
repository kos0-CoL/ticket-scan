'use client';

import { useState } from 'react';
import { Card, CardContent, Button, Input, Modal, Table } from '@ticketscan/ui';
import type { Column, FeedbackImage } from '../../lib/api';

interface FeedbackCorrectionModalProps {
  feedback: FeedbackImage;
  open: boolean;
  onClose: () => void;
  onSave: (feedbackId: string, corrections: Record<string, unknown>, selectedForTraining: boolean) => Promise<void>;
}

const VALID_CATEGORIES = [
  'almacen',
  'frescos',
  'lacteos',
  'bebidas',
  'limpieza',
  'congelados',
  'carnes',
  'frutas_y_verduras',
  'panaderia',
  'otros',
];

interface CorrectionItem {
  _index: number;
  nombre: string;
  cantidad: number;
  precio: number;
  categoria?: string;
}

export default function FeedbackCorrectionModal({
  feedback,
  open,
  onClose,
  onSave,
}: FeedbackCorrectionModalProps) {
  const [corrections, setCorrections] = useState<Record<string, unknown>>(feedback.user_corrections || feedback.ocr_result || {});
  const [selectedForTraining, setSelectedForTraining] = useState(feedback.selected_for_training);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ocrItems = ((feedback.ocr_result as { items?: unknown[] })?.items || []) as Array<{
    nombre: string;
    cantidad: number;
    precio: number;
    categoria?: string;
  }>;

  const correctionItems = ((corrections as { items?: unknown[] })?.items || []) as Array<{
    nombre: string;
    cantidad: number;
    precio: number;
    categoria?: string;
  }>;

  const tableData: CorrectionItem[] = correctionItems.map((item, i) => ({
    _index: i,
    nombre: item.nombre,
    cantidad: item.cantidad,
    precio: item.precio,
    categoria: item.categoria,
  }));

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...correctionItems];
    if (!newItems[index]) newItems[index] = { nombre: '', cantidad: 1, precio: 0 };
    newItems[index] = { ...newItems[index], [field]: value };
    setCorrections({ ...corrections, items: newItems });
  };

  const handleAddItem = () => {
    const newItems = [...correctionItems, { nombre: '', cantidad: 1, precio: 0, categoria: 'otros' }];
    setCorrections({ ...corrections, items: newItems });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = correctionItems.filter((_, i) => i !== index);
    setCorrections({ ...corrections, items: newItems });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(feedback.id, corrections, selectedForTraining);
      onClose();
    } catch (err) {
      setError('Error al guardar correcciones');
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<CorrectionItem>[] = [
    {
      key: 'nombre',
      header: 'Producto',
      width: '35%',
      render: (row: CorrectionItem) => (
        <Input
          value={row.nombre}
          onChange={(e) => handleItemChange(row._index, 'nombre', e.target.value)}
          placeholder="Nombre del producto"
        />
      ),
    },
    {
      key: 'cantidad',
      header: 'Cant.',
      width: '10%',
      render: (row: CorrectionItem) => (
        <Input
          type="number"
          min="1"
          value={row.cantidad}
          onChange={(e) => handleItemChange(row._index, 'cantidad', parseInt(e.target.value) || 1)}
          className="w-16"
        />
      ),
    },
    {
      key: 'precio',
      header: 'Precio',
      width: '15%',
      render: (row: CorrectionItem) => (
        <Input
          type="number"
          step="0.01"
          min="0"
          value={row.precio}
          onChange={(e) => handleItemChange(row._index, 'precio', parseFloat(e.target.value) || 0)}
          className="w-24"
        />
      ),
    },
    {
      key: 'categoria',
      header: 'Categoría',
      width: '25%',
      render: (row: CorrectionItem) => (
        <select
          value={row.categoria || 'otros'}
          onChange={(e) => handleItemChange(row._index, 'categoria', e.target.value)}
          className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-primary"
        >
          {VALID_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '15%',
      render: (row: CorrectionItem) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRemoveItem(row._index)}
          aria-label="Eliminar item"
        >
          ✕
        </Button>
      ),
    },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Corregir OCR" size="lg">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <strong>Ticket:</strong> {feedback.ticket_id} ·{' '}
          <strong>Fecha:</strong> {new Date(feedback.created_at).toLocaleDateString()}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <input
            type="checkbox"
            id="training-checkbox"
            checked={selectedForTraining}
            onChange={(e) => setSelectedForTraining(e.target.checked)}
            className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
          />
          <label htmlFor="training-checkbox" className="text-sm text-slate-700">
            Marcar para re-entrenamiento (mejora el modelo)
          </label>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table
              columns={columns}
              data={tableData}
              keyExtractor={(item) => String(item._index)}
              hover
              divide
              emptyMessage="Sin items detectados"
            />
          </CardContent>
        </Card>

        <Button variant="secondary" size="sm" onClick={handleAddItem} fullWidth>
          + Añadir item
        </Button>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving} fullWidth>
            {saving ? 'Guardando...' : 'Guardar correcciones'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}