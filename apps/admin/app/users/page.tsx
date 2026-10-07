'use client';
import { useEffect, useState } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(data => { setUsers(data); setLoading(false); });
  }, []);

  if (loading) return <main className="p-8"><p>Cargando...</p></main>;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Usuarios</h1>
      <table className="w-full border">
        <thead><tr className="bg-gray-100">
          <th className="p-2 text-left">ID</th>
          <th className="p-2 text-left">Email</th>
          <th className="p-2 text-left">Creado</th>
        </tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.id.slice(0, 8)}...</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{new Date(u.created_at).toLocaleDateString('es-AR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
