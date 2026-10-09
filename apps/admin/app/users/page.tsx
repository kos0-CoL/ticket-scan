'use client';
import { useEffect, useState } from 'react';

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

  return (
    <main className="page-container">
      <div className="page-content">
        <div className="users-header">
          <div>
            <h1 className="section-title">Usuarios</h1>
            <p className="text-muted mt-1">
              Cuentas de Supabase Auth. Solo los <strong>admins</strong> pueden entrar al panel.
            </p>
          </div>
          <button onClick={() => setShowForm(v => !v)} className="btn btn-primary">
            {showForm ? 'Cerrar' : '+ Crear usuario'}
          </button>
        </div>

        {error && <div className="error-box mb-4">{error}</div>}
        {success && <div className="success-box mb-4">{success}</div>}

        {showForm && (
          <form onSubmit={create} className="card-padded mb-8 space-y-4 animate-in">
            <h2 className="panel-title">Nuevo usuario</h2>
            <div className="params-grid">
              <div>
                <label className="form-label" htmlFor="user-email">Email</label>
                <input
                  id="user-email"
                  type="email"
                  className="input"
                  placeholder="usuario@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label" htmlFor="user-pass">Contraseña</label>
                <input
                  id="user-pass"
                  type="password"
                  className="input"
                  placeholder="mínimo 8 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={e => setIsAdmin(e.target.checked)}
                className="checkbox-custom"
              />
              <span className="text-sm">Dar acceso al panel de admin (rol <code>admin</code>)</span>
            </label>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Creando…' : 'Crear usuario'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancelar</button>
            </div>
          </form>
        )}

        <div className="card-padded animate-in">
          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Creado</th>
                  <th>Último acceso</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const admin = roleOf(u) === 'admin';
                  return (
                    <tr key={u.id} className="border-t divide-y">
                      <td className="cell-medium">{u.email ?? '(sin email)'}</td>
                      <td>
                        <span className={`users-badge ${admin ? 'users-badge-admin' : 'users-badge-user'}`}>
                          {admin ? '👑 Admin' : 'Usuario'}
                        </span>
                      </td>
                      <td className="text-muted">{new Date(u.created_at).toLocaleDateString('es-AR')}</td>
                      <td className="text-muted">
                        {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString('es-AR') : '—'}
                      </td>
                      <td className="text-right actions-cell">
                        <button
                          onClick={() => toggleAdmin(u)}
                          disabled={busyId === u.id}
                          className="btn btn-secondary btn-secondary-compact"
                        >
                          {busyId === u.id ? '…' : admin ? 'Quitar admin' : 'Dar admin'}
                        </button>
                        <button
                          onClick={() => remove(u)}
                          disabled={busyId === u.id}
                          className="btn btn-secondary btn-secondary-compact text-danger-compact"
                        >
                          Borrar
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr><td colSpan={5} className="p-6 text-center text-muted">No hay usuarios todavía.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-xs-muted">
          El rol se guarda en <code>app_metadata.role</code> de Supabase Auth. Si acabás de darle admin a
          alguien con sesión abierta, que cierre y abra sesión de nuevo para refrescar el token.
        </p>
      </div>
    </main>
  );
}
