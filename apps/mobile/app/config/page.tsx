'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '../../lib/supabase-browser';
import { Button, Card, CardHeader, CardContent, Input } from '@ticketscan/ui';

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

  useEffect(() => { loadSettings(); }, []);

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
      <main style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ height: '2rem', backgroundColor: 'var(--color-200)', borderRadius: '0.5rem', width: '33%' }} />
          {[...Array(3)].map((_, i) => (
            <Card key={i} padded style={{ height: '5rem', backgroundColor: 'var(--color-50)', borderRadius: '0.75rem' }} />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '6rem' }}>
      <header>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-900)', margin: 0 }}>Configuración</h1>
        <p style={{ color: 'var(--color-500)', fontSize: '0.875rem', margin: 0 }}>Personaliza tu experiencia</p>
      </header>

      {error && (
        <div style={{ borderRadius: '0.75rem', backgroundColor: 'rgba(185, 28, 28, 0.1)', border: '1px solid rgba(185, 28, 28, 0.2)', padding: '0.75rem', fontSize: '0.875rem', color: '#B91C1C' }}>
          {error}
        </div>
      )}

      {/* Budget Section */}
      <Card padded style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <CardHeader title="Presupuesto mensual">
          <span style={{ width: '2rem', height: '2rem', borderRadius: '0.75rem', backgroundColor: 'rgba(0, 171, 228, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', marginRight: '0.5rem' }}>💰</span>
        </CardHeader>
        <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="monthlyBudget" style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-700)' }}>Presupuesto mensual</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-400)' }}>$</span>
              <Input
                id="monthlyBudget"
                type="number"
                min={0}
                step={1000}
                value={settings.monthlyBudget}
                onChange={e => handleChange('monthlyBudget', Number(e.target.value))}
                placeholder="500000"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-500)', marginTop: '0.25rem' }}>
              Ejemplo: {formatCurrency(settings.monthlyBudget)}
            </p>
          </div>

          <div>
            <label htmlFor="budgetAlertThreshold" style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-700)' }}>
              Alerta de presupuesto ({settings.budgetAlertThreshold}%)
            </label>
            <input
              id="budgetAlertThreshold"
              type="range"
              min="50"
              max="100"
              value={settings.budgetAlertThreshold}
              onChange={e => handleChange('budgetAlertThreshold', Number(e.target.value))}
              style={{ width: '100%', height: '0.5rem', backgroundColor: 'var(--color-200)', borderRadius: '0.5rem', appearance: 'none', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--color-500)', marginTop: '0.25rem' }}>
              Te avisamos cuando superes el {settings.budgetAlertThreshold}% de tu presupuesto
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card padded style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <CardHeader title="Preferencias">
          <span style={{ width: '2rem', height: '2rem', borderRadius: '0.75rem', backgroundColor: 'rgba(0, 171, 228, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', marginRight: '0.5rem' }}>⚙️</span>
        </CardHeader>
        <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'spaceBetween', cursor: 'pointer' }}>
            <div>
              <p style={{ fontWeight: '500', color: 'var(--color-900)', margin: 0 }}>Categorización automática</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-500)', margin: 0 }}>Clasifica productos con IA al escanear</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoCategorize}
              onChange={e => handleChange('autoCategorize', e.target.checked)}
              style={{ width: '1.25rem', height: '1.25rem', borderRadius: '0.375rem', border: '1px solid var(--color-300)', accentColor: 'var(--color-primary)' }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'spaceBetween', cursor: 'pointer' }}>
            <div>
              <p style={{ fontWeight: '500', color: 'var(--color-900)', margin: 0 }}>Notificaciones push</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-500)', margin: 0 }}>Alertas de presupuesto y recordatorios</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={e => handleChange('notifications', e.target.checked)}
              style={{ width: '1.25rem', height: '1.25rem', borderRadius: '0.375rem', border: '1px solid var(--color-300)', accentColor: 'var(--color-primary)' }}
            />
          </label>

          <div>
            <label htmlFor="theme" style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-700)' }}>Tema</label>
            <select
              id="theme"
              value={settings.theme}
              onChange={e => handleChange('theme', e.target.value as 'light' | 'dark' | 'system')}
              style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid rgba(0, 171, 228, 0.1)', borderRadius: '0.5rem', backgroundColor: 'white', color: 'var(--color-900)', fontSize: '0.875rem', outline: 'none' }}
            >
              <option value="system">Sistema (automático)</option>
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Data Section */}
      <Card padded style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <CardHeader title="Datos y privacidad">
          <span style={{ width: '2rem', height: '2rem', borderRadius: '0.75rem', backgroundColor: 'rgba(0, 171, 228, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', marginRight: '0.5rem' }}>📊</span>
        </CardHeader>
        <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem' }}>📤</span>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <p style={{ fontWeight: '500', color: 'var(--color-900)', margin: 0 }}>Exportar todos mis datos</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-500)', margin: 0 }}>Descargar JSON con tickets y análisis</p>
            </div>
          </Button>
          <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem' }}>📄</span>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <p style={{ fontWeight: '500', color: 'var(--color-900)', margin: 0 }}>Exportar a PDF/Excel</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-500)', margin: 0 }}>Reportes mensuales para contabilidad</p>
            </div>
          </Button>
          <Button variant="ghost" style={{ width: '100%', justifyContent: 'flex-start', gap: '0.75rem', color: '#B91C1C' }}>
            <span style={{ fontSize: '1.25rem' }}>🗑️</span>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <p style={{ fontWeight: '500', color: 'var(--color-900)', margin: 0 }}>Eliminar mi cuenta</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-500)', margin: 0 }}>Borrar todos mis datos permanentemente</p>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* Version Info */}
      <Card padded style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <CardHeader title="Acerca de">
          <span style={{ width: '2rem', height: '2rem', borderRadius: '0.75rem', backgroundColor: 'rgba(0, 171, 228, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', marginRight: '0.5rem' }}>ℹ️</span>
        </CardHeader>
        <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-600)' }}>
          <div style={{ display: 'flex', justifyContent: 'spaceBetween' }}>
            <span>Versión</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>1.0.0-beta</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'spaceBetween' }}>
            <span>Canal</span>
            <span>Beta</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'spaceBetween' }}>
            <span>Plataforma</span>
            <span>Android / Web</span>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button variant="primary" onClick={saveSettings} disabled={saving} style={{ width: '100%', padding: '0.75rem' }}>
        {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar cambios'}
      </Button>

      {saved && (
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#047857' }}>
          Cambios guardados correctamente
        </p>
      )}
    </main>
  );
}