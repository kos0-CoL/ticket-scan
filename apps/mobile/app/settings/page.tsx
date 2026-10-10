'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, Input, Select, Button, Badge } from '@ticketscan/ui';
import { createBrowserSupabaseClient } from '../../lib/supabase';

interface UserPreferences {
  monthlyBudget: number;
  budgetAlertThreshold: number;
  currency: string;
  notifications: boolean;
  autoCategorize: boolean;
  theme: 'light' | 'dark' | 'system';
}

export default function SettingsPage() {
  const supabase = createBrowserSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    monthlyBudget: 0,
    budgetAlertThreshold: 80,
    currency: 'ARS',
    notifications: true,
    autoCategorize: true,
    theme: 'system',
  });
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('full_name, preferences')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setFullName(data.full_name || '');
      if (data.preferences) {
        setPreferences(prev => ({ ...prev, ...data.preferences }));
      }
    }

    const { data: authData } = await supabase.auth.getUser();
    if (authData.user?.email) {
      setEmail(authData.user.email);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage({ type: 'error', text: 'No autenticado' });
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        full_name: fullName,
        preferences: preferences,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Preferencias guardadas' });
    }
    setSaving(false);
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const showMessage = message ? (
    <div className={`p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
      {message.text}
    </div>
  ) : null;

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Configuración</h1>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Configuración</h1>

      {showMessage}

      {/* Account */}
      <Card elevated>
        <CardHeader title="Cuenta" subtitle="Gestiona tu perfil y preferencias" />
        <CardContent className="space-y-4">
          <Input label="Email" value={email} disabled />
          <Input label="Nombre" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Tu nombre" />
          <Select label="Moneda" value={preferences.currency} onChange={e => handlePreferenceChange('currency', e.target.value)} options={[{ value: 'ARS', label: 'Peso Argentino (ARS)' }, { value: 'USD', label: 'Dólar (USD)' }]} />
          <Select label="Tema" value={preferences.theme} onChange={e => handlePreferenceChange('theme', e.target.value as 'light' | 'dark' | 'system')} options={[{ value: 'light', label: 'Claro' }, { value: 'dark', label: 'Oscuro' }, { value: 'system', label: 'Sistema' }]} />
        </CardContent>
      </Card>

      {/* Budget */}
      <Card elevated>
        <CardHeader title="Presupuesto mensual" subtitle="Recibe alertas cuando te acerques al límite" />
        <CardContent className="space-y-4">
          <Input label="Límite mensual" type="number" value={preferences.monthlyBudget} onChange={e => handlePreferenceChange('monthlyBudget', parseInt(e.target.value) || 0)} placeholder="150000" />
          <Input label="Umbral de alerta (%)" type="number" value={preferences.budgetAlertThreshold} onChange={e => handlePreferenceChange('budgetAlertThreshold', parseInt(e.target.value) || 80)} placeholder="80" />
          <Select label="Notificaciones" value={preferences.notifications ? 'enabled' : 'disabled'} onChange={e => handlePreferenceChange('notifications', e.target.value === 'enabled')} options={[{ value: 'enabled', label: 'Activadas' }, { value: 'disabled', label: 'Desactivadas' }]} />
          <Select label="Auto-categorizar" value={preferences.autoCategorize ? 'enabled' : 'disabled'} onChange={e => handlePreferenceChange('autoCategorize', e.target.value === 'enabled')} options={[{ value: 'enabled', label: 'Activado' }, { value: 'disabled', label: 'Desactivado' }]} />
        </CardContent>
      </Card>

      {/* Actions */}
      <Card elevated>
        <CardHeader title="Datos y privacidad" subtitle="Controla tu información" />
        <CardContent className="space-y-3">
          <Button variant="secondary" fullWidth>Exportar datos (PDF)</Button>
          <Button variant="secondary" fullWidth>Exportar datos (Excel)</Button>
          <Button variant="danger" fullWidth>Eliminar cuenta</Button>
        </CardContent>
      </Card>

      {/* About */}
      <Card elevated>
        <CardHeader title="Acerca de" />
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>TicketScan v1.0.0-beta</p>
          <p>Hecho con ❤️ en Argentina 🇦🇷</p>
          <p className="pt-2">Usa IA para leer tus tickets y categorizar gastos automáticamente.</p>
        </CardContent>
      </Card>

      <Button className="w-full mt-4" onClick={handleSave} loading={saving}>
        Guardar cambios
      </Button>
    </div>
  );
}