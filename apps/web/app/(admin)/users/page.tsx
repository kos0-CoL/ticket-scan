'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent, Table, Button, Input, Select, Badge, StatusBadge, Modal, ConfirmModal } from '@ticketscan/ui';
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

const mockUsers: User[] = [
  { id: '1', email: 'admin@ticketscan.ar', full_name: 'Admin TicketScan', role: 'admin', created_at: '2025-01-01', ticket_count: 0, total_spent: 0 },
  { id: '2', email: 'maria.gonzalez@email.com', full_name: 'María González', role: 'user', created_at: '2025-01-10', ticket_count: 45, total_spent: 124500 },
  { id: '3', email: 'carlos.rodriguez@email.com', full_name: 'Carlos Rodríguez', role: 'user', created_at: '2025-01-12', ticket_count: 23, total_spent: 67890 },
  { id: '4', email: 'lucia.martinez@email.com', full_name: 'Lucía Martínez', role: 'user', created_at: '2025-01-14', ticket_count: 12, total_spent: 34200 },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
  const [formData, setFormData] = useState({ email: '', full_name: '', role: 'user' as 'admin' | 'user' });

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

  const handleSave = () => {
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
    }
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ email: '', full_name: '', role: 'user' });
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      setUsers(users.filter(u => u.id !== deleteConfirm.id));
      setDeleteConfirm(null);
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

      <Card elevated>
        <Table columns={columns} data={users} keyExtractor={u => u.id} hover divide />
      </Card>

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