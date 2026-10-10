'use client';

import { Card, CardHeader, CardContent, Input, Select, Button, Badge } from '@ticketscan/ui';

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Configuración</h1>

      {/* Account */}
      <Card elevated>
        <CardHeader title="Cuenta" subtitle="Gestiona tu perfil y preferencias" />
        <CardContent className="space-y-4">
          <Input label="Email" value="usuario@email.com" disabled />
          <Input label="Nombre" value="Juan Pérez" placeholder="Tu nombre" />
          <Select label="Moneda" value="ARS" options={[{ value: 'ARS', label: 'Peso Argentino (ARS)' }, { value: 'USD', label: 'Dólar (USD)' }]} />
          <Select label="Tema" value="system" options={[{ value: 'light', label: 'Claro' }, { value: 'dark', label: 'Oscuro' }, { value: 'system', label: 'Sistema' }]} />
        </CardContent>
      </Card>

      {/* Budget */}
      <Card elevated>
        <CardHeader title="Presupuesto mensual" subtitle="Recibe alertas cuando te acerques al límite" />
        <CardContent className="space-y-4">
          <Input label="Límite mensual" type="number" value="150000" placeholder="150000" />
          <Input label="Umbral de alerta (%)" type="number" value="80" placeholder="80" />
          <Select label="Notificaciones" value="enabled" options={[{ value: 'enabled', label: 'Activadas' }, { value: 'disabled', label: 'Desactivadas' }]} />
        </CardContent>
      </Card>

      {/* Data */}
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
    </div>
  );
}