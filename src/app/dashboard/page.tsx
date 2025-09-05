'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Settings } from 'lucide-react';
import Button from '@/components/ui/Button';
import TimelineCalendar from '@/components/TimelineCalendar';
import AppointmentForm from '@/components/AppointmentForm';
import { IAppointment } from '@/models/Appointment';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'hairdresser';
  canCreateAppointments: boolean;
  canModifyAppointments: boolean;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<IAppointment | undefined>();
  const [prefilledData, setPrefilledData] = useState<{ date?: string; time?: string } | null>(null);
  const [hairdressers, setHairdressers] = useState<Array<{ id: string; name: string }>>([]);
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
    fetchHairdressers();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      router.push('/login');
    }
  };

  const fetchHairdressers = async () => {
    try {
      const response = await fetch('/api/users?role=hairdresser');
      if (response.ok) {
        const data = await response.json();
        setHairdressers(data.users.map((u: any) => ({ id: u._id, name: u.name })));
      }
    } catch (error) {
      console.error('Error fetching hairdressers:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleCreateAppointment = (date?: string, time?: string) => {
    setEditingAppointment(undefined);
    setPrefilledData(date && time ? { date, time } : null);
    setShowAppointmentForm(true);
  };

  const handleEditAppointment = (appointment: IAppointment) => {
    console.log('Dashboard handleEditAppointment called:', {
      appointmentId: appointment._id,
      userRole: user?.role,
      canModifyAppointments: user?.canModifyAppointments
    });
    setEditingAppointment(appointment);
    setPrefilledData(null); // Clear prefilled data when editing
    setShowAppointmentForm(true);
  };

  const handleSaveAppointment = async (data: any) => {
    try {
      const url = editingAppointment
        ? `/api/appointments/${editingAppointment._id}`
        : '/api/appointments';

      const method = editingAppointment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowAppointmentForm(false);
        setEditingAppointment(undefined);
        // Refresh the calendar
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al guardar el turno');
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert('Error al guardar el turno');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Scorpio Salón
            </h1>
            <p className="text-sm text-gray-600">
              {user.name}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {user.role === 'admin' && (
              <Button
                className='flex justify-center items-center h-10'
                variant="secondary"
                size="sm"
                onClick={() => router.push('/admin')}
              >
                <Settings className="w-4 h-4 mr-1" />
                Admin
              </Button>
            )}

            <Button
              className='flex justify-center items-center h-10'
              variant="secondary"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-1" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-73px)]">
        <TimelineCalendar
          onCreateAppointment={handleCreateAppointment}
          onEditAppointment={handleEditAppointment}
          canCreateAppointments={user.role === 'admin' || user.canCreateAppointments}
          canModifyAppointments={user.role === 'admin' || user.canModifyAppointments}
          hairdressers={hairdressers}
        />
      </main>

      {/* Appointment Form Modal */}
      {showAppointmentForm && (
        <AppointmentForm
          appointment={editingAppointment}
          prefilledData={prefilledData}
          onClose={() => {
            setShowAppointmentForm(false);
            setEditingAppointment(undefined);
            setPrefilledData(null);
          }}
          onSave={handleSaveAppointment}
          hairdressers={hairdressers}
        />
      )}
    </div>
  );
}
