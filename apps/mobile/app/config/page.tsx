'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '../../lib/supabase-browser';

import '@/app/globals.css';

interface UserSettings {
  monthlyBudget: number;
  budgetAlertThreshold: number;
  currency: string;
  notifications: boolean;
  autoCategorize: boolean;
  theme: 'light' | 'dark' | 'system';
}

const DEFAULT_SETTINGS: UserSettings = {
  monthlyBudget: 500000,
  budgetAlertThreshold: 80,
  currency: 'ARS',
  notifications: true,
  autoCategorize: true,
  theme: 'system',
};

export default function ConfigPage() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const res = await fetch(`/api/settings?userId=${user.id}`);
      if (res.ok) {
        const json = await res.json();
        setSettings(prev => ({ ...prev, ...json }));
      }
    } catch (err: any) {
      console.error('Error loading settings:', err);
      setError('No se pudieron cargar los ajustes');
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    try {
      setSaving(true);
      setError(null);
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const res = await fetch(`/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...settings }),
      });

      if (!res.ok) throw new Error('Error al guardar');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  function handleChange<K extends keyof UserSettings>(key: K, value: UserSettings[K]) {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  if (loading) {
    return (
      <main className="p-4 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card-padded h-20 bg-slate-50 rounded-xl" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 pb-24 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-500 text-sm">Personaliza tu experiencia</p>
      </header>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700 animate-in">
          {error}
        </div>
      )}

      {/* Budget Section */}
      <section className="card-padded space-y-6">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center text-primary">💰</span>
          Presupuesto mensual
        </h2>

        <div>
          <label htmlFor="monthlyBudget" className="label">Presupuesto mensual</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
            <input
              id="monthlyBudget"
              type="number"
              min="0"
              step="1000"
              value={settings.monthlyBudget}
              onChange={e => handleChange('monthlyBudget', Number(e.target.value))}
              className="input pl-8"
              placeholder="500000"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ejemplo: {formatCurrency(settings.monthlyBudget)}
          </p>
        </div>

        <div>
          <label htmlFor="budgetAlertThreshold" className="label">
            Alerta de presupuesto ({settings.budgetAlertThreshold}%)
          </label>
          <input
            id="budgetAlertThreshold"
            type="range"
            min="50"
            max="100"
            value={settings.budgetAlertThreshold}
            onChange={e => handleChange('budgetAlertThreshold', Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <p className="text-xs text-slate-500 mt-1">
            Te avisamos cuando superes el {settings.budgetAlertThreshold}% de tu presupuesto
          </p>
        </div>
      </section>

      {/* Preferences Section */}
      <section className="card-padded space-y-4">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center text-primary">⚙️</span>
          Preferencias
        </h2>

        <label className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900">Categorización automática</p>
            <p className="text-sm text-slate-500">Clasifica productos con IA al escanear</p>
          </div>
          <input
            type="checkbox"
            checked={settings.autoCategorize}
            onChange={e => handleChange('autoCategorize', e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
          />
        </label>

        <label className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900">Notificaciones push</p>
            <p className="text-sm text-slate-500">Alertas de presupuesto y recordatorios</p>
          </div>
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={e => handleChange('notifications', e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
          />
        </label>

        <div>
          <label htmlFor="theme" className="label">Tema</label>
          <select
            id="theme"
            value={settings.theme}
            onChange={e => handleChange('theme', e.target.value as 'light' | 'dark' | 'system')}
            className="input"
          >
            <option value="system">Sistema (automático)</option>
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
          </select>
        </div>
      </section>

      {/* Data Section */}
      <section className="card-padded space-y-4">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center text-primary">📊</span>
          Datos y privacidad
        </h2>

        <div className="space-y-3">
          <button className="btn-secondary w-full justify-start gap-3">
            <span className="text-lg">📤</span>
            <div className="text-left">
              <p className="font-medium text-slate-900">Exportar todos mis datos</p>
              <p className="text-sm text-slate-500">Descargar JSON con tickets y análisis</p>
            </div>
          </button>
          <button className="btn-secondary w-full justify-start gap-3">
            <span className="text-lg">📄</span>
            <div className="text-left">
              <p className="font-medium text-slate-900">Exportar a PDF/Excel</p>
              <p className="text-sm text-slate-500">Reportes mensuales para contabilidad</p>
            </div>
          </button>
          <button className="btn-ghost w-full justify-start gap-3 text-red-600 hover:bg-red-50">
            <span className="text-lg">🗑️</span>
            <div className="text-left">
              <p className="font-medium text-slate-900">Eliminar mi cuenta</p>
              <p className="text-sm text-slate-500">Borrar todos mis datos permanentemente</p>
            </div>
          </button>
        </div>
      </section>

      {/* Version Info */}
      <section className="card-padded">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center text-primary">ℹ️</span>
          Acerca de
        </h2>
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Versión</span>
            <span className="font-mono text-primary">1.0.0-beta</span>
          </div>
          <div className="flex justify-between">
            <span>Canal</span>
            <span>Beta</span>
          </div>
          <div className="flex justify-between">
            <span>Plataforma</span>
            <span>Android / Web</span>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <button
        onClick={saveSettings}
        disabled={saving}
        className="btn-primary w-full py-3"
      >
        {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar cambios'}
      </button>

      {saved && (
        <p className="text-center text-sm text-green-600 animate-in">
          Cambios guardados correctamente
        </p>
      )}
    </main>
  );
}