'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

interface RegisterFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegisterForm({ onClose, onSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'hairdresser',
    canCreateAppointments: false,
    canModifyAppointments: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // User registered and automatically logged in
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Error al crear usuario');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Crear Nuevo Usuario</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <Input
            label="Nombre completo"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Ej: María García"
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="maria@ejemplo.com"
          />

          <Input
            label="Contraseña"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Mínimo 6 caracteres"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="hairdresser">Peluquero</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {formData.role === 'hairdresser' && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700">Permisos del Peluquero</h3>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="canCreate"
                  name="canCreateAppointments"
                  checked={formData.canCreateAppointments}
                  onChange={handleChange}
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
                  name="canModifyAppointments"
                  checked={formData.canModifyAppointments}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="canModify" className="text-sm text-gray-700">
                  Puede modificar turnos
                </label>
              </div>
            </div>
          )}

          {formData.role === 'admin' && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Los administradores tienen todos los permisos automáticamente.
              </p>
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
              {loading ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
