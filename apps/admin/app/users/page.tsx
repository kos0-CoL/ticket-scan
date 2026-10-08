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

  if (loading) return <main className="page-container"><p className="text-slate-600">Cargando usuarios...</p></main>;

  return (
    <main className="page-container">
      <div className="page-content">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 animate-in">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
            <p className="text-slate-500 mt-1">
              Cuentas de Supabase Auth. Solo los <strong>admins</strong> pueden entrar al panel.
            </p>
          </div>
          <button onClick={() => setShowForm(v => !v)} className="btn-primary">
            {showForm ? 'Cerrar' : '+ Crear usuario'}
          </button>
        </div>

        {error && <div className="mb-4 p-3 rounded-xl bg-danger-light text-danger-dark text-sm animate-in">{error}</div>}
        {success && <div className="mb-4 p-3 rounded-xl bg-success-light text-success-dark text-sm animate-in">{success}</div>}

        {showForm && (
          <form onSubmit={create} className="card-padded mb-8 space-y-4 animate-in">
            <h2 className="font-semibold text-slate-900">Nuevo usuario</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="user-email">Email</label>
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
                <label className="label" htmlFor="user-pass">Contraseña</label>
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
                className="rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-slate-700">Dar acceso al panel de admin (rol <code>admin</code>)</span>
            </label>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Creando…' : 'Crear usuario'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        )}

        <div className="card-padded animate-in">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary-light/50 text-left text-slate-500">
                <th className="p-3">Email</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Creado</th>
                <th className="p-3">Último acceso</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const admin = roleOf(u) === 'admin';
                return (
                  <tr key={u.id} className="border-b border-slate-100 last:border-0">
                    <td className="p-3 font-medium text-slate-900">{u.email ?? '(sin email)'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${admin ? 'bg-primary-light text-primary-dark' : 'bg-slate-100 text-slate-600'}`}>
                        {admin ? '👑 Admin' : 'Usuario'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{new Date(u.created_at).toLocaleDateString('es-AR')}</td>
                    <td className="p-3 text-slate-500">
                      {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString('es-AR') : '—'}
                    </td>
                    <td className="p-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => toggleAdmin(u)}
                        disabled={busyId === u.id}
                        className="btn-secondary !py-1.5 !px-3 !text-xs"
                      >
                        {busyId === u.id ? '…' : admin ? 'Quitar admin' : 'Dar admin'}
                      </button>
                      <button
                        onClick={() => remove(u)}
                        disabled={busyId === u.id}
                        className="btn-secondary !py-1.5 !px-3 !text-xs !text-danger !border-danger-light hover:!bg-danger-light"
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-slate-400">No hay usuarios todavía.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          El rol se guarda en <code>app_metadata.role</code> de Supabase Auth. Si acabás de darle admin a
          alguien con sesión abierta, que cierre y abra sesión de nuevo para refrescar el token.
        </p>
      </div>
    </main>
  );
}
