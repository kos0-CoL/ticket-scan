'use client';

import { useEffect, useState } from 'react';
import { Table, Button, Modal, Badge } from '@ticketscan/ui';

interface User {
  id: string;
  email?: string;
  created_at: string;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
  last_sign_in_at?: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState('');

  async function load() {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar usuarios');
      setUsers(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, isAdmin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear usuario');
      setSuccess(`Usuario ${data.email} creado${data.isAdmin ? ' con acceso al admin' : ''}`);
      setEmail(''); setPassword(''); setIsAdmin(false); setShowForm(false);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleAdmin(u: User) {
    const current = u.app_metadata?.role === 'admin';
    setBusyId(u.id);
    setError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: u.id, isAdmin: !current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar rol');
      setSuccess(`${u.email} → ${!current ? 'admin' : 'usuario'}`);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusyId('');
    }
  }

  async function remove(u: User) {
    if (!confirm(`¿Borrar el usuario ${u.email}? Esta acción no se puede deshacer.`)) return;
    setBusyId(u.id);
    setError('');
    try {
      const res = await fetch('/api/admin/users?id=' + u.id, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al borrar');
      }
      setSuccess(`Usuario ${u.email} borrado`);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusyId('');
    }
  }

  const roleOf = (u: User) => (u.app_metadata?.role === 'admin' ? 'admin' : 'usuario');

  if (loading) return <main className="page-container"><p className="text-muted">Cargando usuarios...</p></main>;

  const columns = [
    { key: 'email', header: 'Email', render: (u: User) => <span className="font-medium">{u.email ?? '(sin email)'}</span> },
    {
      key: 'role',
      header: 'Rol',
      render: (u: User) => {
        const admin = roleOf(u) === 'admin';
        return <Badge variant={admin ? 'success' : 'muted'} dot>{admin ? '👑 Admin' : 'Usuario'}</Badge>;
      },
    },
    { key: 'created_at', header: 'Creado', render: (u: User) => <span className="text-muted">{new Date(u.created_at).toLocaleDateString('es-AR')}</span> },
    { key: 'last_sign_in_at', header: 'Último acceso', render: (u: User) => <span className="text-muted">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString('es-AR') : '—'}</span> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (u: User) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toggleAdmin(u)}
            disabled={busyId === u.id}
          >
            {busyId === u.id ? '…' : roleOf(u) === 'admin' ? 'Quitar admin' : 'Dar admin'}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => remove(u)}
            disabled={busyId === u.id}
          >
            {busyId === u.id ? '…' : 'Borrar'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <main className="page-container">
      <div className="page-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-900)', margin: 0 }}>Usuarios</h1>
            <p style={{ color: 'var(--color-500)', marginTop: '0.25rem' }}>Cuentas de Supabase Auth. Solo los <strong>admins</strong> pueden entrar al panel.</p>
          </div>
          <Button onClick={() => setShowForm(v => !v)}>{showForm ? 'Cerrar' : '+ Crear usuario'}</Button>
        </div>

        {error && <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--color-danger-light)', color: '#B91C1C', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</div>}
        {success && <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--color-success-light)', color: '#047857', fontSize: '0.875rem', marginBottom: '1rem' }}>{success}</div>}

        <Modal
          open={showForm}
          onClose={() => setShowForm(false)}
          title="Nuevo usuario"
          size="lg"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button variant="primary" type="submit" form="user-form" disabled={saving}>
                {saving ? 'Creando…' : 'Crear usuario'}
              </Button>
            </>
          }
        >
          <form id="user-form" onSubmit={create} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-700)' }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', borderRadius: '1rem', border: '1px solid var(--color-200)', backgroundColor: 'var(--color-white)', padding: '0.75rem 1rem', fontSize: '0.9375rem', color: 'var(--color-900)', fontFamily: 'var(--font-sans)' }}
                  placeholder="usuario@email.com"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-700)' }}>Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', borderRadius: '1rem', border: '1px solid var(--color-200)', backgroundColor: 'var(--color-white)', padding: '0.75rem 1rem', fontSize: '0.9375rem', color: 'var(--color-900)', fontFamily: 'var(--font-sans)' }}
                  placeholder="mínimo 8 caracteres"
                  minLength={8}
                  required
                />
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={e => setIsAdmin(e.target.checked)}
                style={{ width: '1rem', height: '1rem', borderRadius: '0.375rem', border: '1px solid var(--color-300)', accentColor: 'var(--color-primary)' }}
              />
              <span style={{ fontSize: '0.875rem' }}>Dar acceso al panel de admin (rol <code>admin</code>)</span>
            </label>
          </form>
        </Modal>

        <Table
          columns={columns}
          data={users}
          keyExtractor={(u) => u.id}
          hover
          divide
          emptyMessage="No hay usuarios todavía."
        />

        <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--color-500)' }}>
          El rol se guarda en <code>app_metadata.role</code> de Supabase Auth. Si acabás de darle admin a
          alguien con sesión abierta, que cierre y abra sesión de nuevo para refrescar el token.
        </p>
      </div>
    </main>
  );
}