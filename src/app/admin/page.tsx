'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'hairdresser';
  canCreateAppointments: boolean;
  canModifyAppointments: boolean;
  isActive: boolean;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchUsers();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              className='flex justify-center items-center h-10'
              variant="secondary"
              size="sm"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">
              Panel de Administración
            </h1>
          </div>

          <Button
            className='flex justify-center items-center min-h-10'
            onClick={handleCreateUser}
          >
            <Plus className="w-6 h-6 mr-1" />
            Nuevo Usuario
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Gestión de Peluqueros
          </h2>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              {users.map((user) => (
                <Card key={user._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-gray-900">{user.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                          }`}>
                          {user.role === 'admin' ? 'Administrador' : 'Peluquero'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{user.email}</p>

                      {user.role === 'hairdresser' && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${user.canCreateAppointments
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {user.canCreateAppointments ? 'Puede crear turnos' : 'No puede crear turnos'}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${user.canModifyAppointments
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {user.canModifyAppointments ? 'Puede modificar turnos' : 'No puede modificar turnos'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {user.role !== 'admin' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* User Form Modal */}
      {showUserForm && (
        <UserForm
          user={editingUser}
          onClose={() => {
            setShowUserForm(false);
            setEditingUser(null);
          }}
          onSave={() => {
            setShowUserForm(false);
            setEditingUser(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}

interface UserFormProps {
  user: User | null;
  onClose: () => void;
  onSave: () => void;
}

function UserForm({ user, onClose, onSave }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'hairdresser',
    canCreateAppointments: user?.canCreateAppointments || false,
    canModifyAppointments: user?.canModifyAppointments || false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = user ? `/api/users/${user._id}` : '/api/users';
      const method = user ? 'PUT' : 'POST';

      const body = user
        ? { ...formData, password: formData.password || undefined }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        onSave();
      } else {
        const data = await response.json();
        setError(data.error || 'Error al guardar usuario');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {user ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <Input
            label="Nombre"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label={user ? "Nueva Contraseña (opcional)" : "Contraseña"}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!user}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'hairdresser' })}
              className="input-field"
            >
              <option value="hairdresser">Peluquero</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {formData.role === 'hairdresser' && (
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="canCreate"
                  checked={formData.canCreateAppointments}
                  onChange={(e) => setFormData({ ...formData, canCreateAppointments: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="canCreate" className="text-sm text-gray-700">
                  Puede crear turnos
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="canModify"
                  checked={formData.canModifyAppointments}
                  onChange={(e) => setFormData({ ...formData, canModifyAppointments: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="canModify" className="text-sm text-gray-700">
                  Puede modificar turnos
                </label>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
