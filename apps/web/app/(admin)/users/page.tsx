'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, Table, Button, Input, Select, Badge, Modal, ConfirmModal } from '@ticketscan/ui';
import type { Column } from '@ticketscan/ui';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
  created_at: string;
  ticket_count: number;
  total_spent: number;
}

interface PaginatedResponse<T> {
  ok: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
  const [formData, setFormData] = useState({ email: '', full_name: '', role: 'user' as 'admin' | 'user' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?page=${page}&limit=20`);
      const result: PaginatedResponse<User> = await res.json();
      if (result.ok) {
        setUsers(result.data);
        setTotalPages(result.pagination.totalPages);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const columns: Column<User>[] = [
    { key: 'email', header: 'Email', render: (u) => <span className="font-medium">{u.email}</span> },
    { key: 'full_name', header: 'Nombre', render: (u) => <span>{u.full_name || '—'}</span> },
    { key: 'role', header: 'Rol', render: (u) => <Badge variant={u.role === 'admin' ? 'primary' : 'muted'}>{u.role}</Badge> },
    { key: 'ticket_count', header: 'Tickets', render: (u) => <span>{u.ticket_count}</span> },
    { key: 'total_spent', header: 'Total gastado', render: (u) => <span className="font-mono">${u.total_spent.toLocaleString()}</span> },
    { key: 'created_at', header: 'Registrado', render: (u) => <span>{u.created_at}</span> },
    { key: 'actions', header: 'Acciones', render: (u) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => handleEdit(u)}>Editar</Button>
        <Button variant="danger" size="sm" onClick={() => setDeleteConfirm(u)}>Eliminar</Button>
      </div>
    )},
  ];

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ email: user.email, full_name: user.full_name || '', role: user.role });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.ok) {
        await fetchUsers();
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData({ email: '', full_name: '', role: 'user' });
      } else {
        alert(result.error || 'Error al guardar');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const res = await fetch(`/api/admin/users/${deleteConfirm.id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.ok) {
        await fetchUsers();
        setDeleteConfirm(null);
      } else {
        alert(result.error || 'Error al eliminar');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de usuarios</h1>
          <p className="text-slate-500">Administra usuarios, roles y permisos</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <Card elevated>
          <Table columns={columns} data={users} keyExtractor={u => u.id} hover divide emptyMessage="No hay usuarios" />
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
          <span className="text-sm text-slate-600">Página {page} de {totalPages}</span>
          <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Siguiente</Button>
        </div>
      )}

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? 'Editar usuario' : 'Nuevo usuario'} size="md">
        <div className="space-y-4">
          <Input label="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} type="email" placeholder="usuario@email.com" disabled={!!editingUser} />
          <Input label="Nombre completo" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} placeholder="Juan Pérez" />
          <Select label="Rol" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })} options={[{ value: 'user', label: 'Usuario' }, { value: 'admin', label: 'Administrador' }]} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="Eliminar usuario" message={`¿Eliminar a ${deleteConfirm?.email}? Esta acción no se puede deshacer.`} />
    </div>
  );
}