'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Calendar, Clock, User, Phone, DollarSign, Filter, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
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

export default function AllAppointmentsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<IAppointment | undefined>();
  const [hairdressers, setHairdressers] = useState<Array<{ id: string; name: string }>>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: format(new Date(), 'yyyy-MM-dd'), // Por defecto desde hoy
    toDate: '',
    status: 'all'
  });
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
    fetchHairdressers();
    fetchAllAppointments();
  }, []);

  useEffect(() => {
    if (user) {
      fetchAllAppointments();
    }
  }, [filters]);

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

  const fetchAllAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`/api/appointments/all?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
    setLoading(false);
  };

  const handleEditAppointment = (appointment: IAppointment) => {
    setEditingAppointment(appointment);
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
        fetchAllAppointments(); // Refresh the list
      } else {
        console.error('Error saving appointment');
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendiente';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const groupAppointmentsByDate = (appointments: IAppointment[]) => {
    const groups: { [key: string]: IAppointment[] } = {};
    
    appointments.forEach(appointment => {
      const dateKey = format(new Date(appointment.date), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(appointment);
    });

    // Sort each group by time
    Object.keys(groups).forEach(date => {
      groups[date].sort((a, b) => a.time.localeCompare(b.time));
    });

    return groups;
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const groupedAppointments = groupAppointmentsByDate(appointments);
  const sortedDates = Object.keys(groupedAppointments).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Button
                className='flex justify-center items-center h-10'
                variant="secondary"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Volver
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Todos los Turnos
                </h1>
                <p className="text-sm text-gray-600">
                  Vista cronológica
                </p>
              </div>
            </div>
            <Button
              className='flex justify-center items-center h-10'
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-1" />
              Filtros
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Filtros</h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Fecha Desde */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={filters.fromDate}
                    onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Fecha Hasta */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Hasta (opcional)
                  </label>
                  <input
                    type="date"
                    value={filters.toDate}
                    onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Todos</option>
                    <option value="pending">Pendiente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="completed">Completado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Quick filters */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setFilters({ 
                    fromDate: format(new Date(), 'yyyy-MM-dd'), 
                    toDate: '', 
                    status: 'all' 
                  })}
                >
                  Desde hoy
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setFilters({ 
                    fromDate: format(new Date(), 'yyyy-MM-dd'), 
                    toDate: '', 
                    status: 'pending' 
                  })}
                >
                  Pendientes
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setFilters({ 
                    fromDate: format(new Date(), 'yyyy-MM-dd'), 
                    toDate: '', 
                    status: 'confirmed' 
                  })}
                >
                  Confirmados
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setFilters({ 
                    fromDate: '', 
                    toDate: '', 
                    status: 'all' 
                  })}
                >
                  Todos históricos
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay turnos agendados</h3>
            <p className="text-gray-600">Los turnos aparecerán aquí una vez que se creen.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <div key={date} className="space-y-4">
                {/* Date Header */}
                <div className="flex items-center space-x-3">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <h2 className="text-lg font-semibold text-gray-900 bg-gray-50 px-4 py-2 rounded-full">
                    {format(new Date(date), 'EEEE, d MMMM yyyy', { locale: es })}
                  </h2>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Appointments for this date */}
                <div className="grid gap-3">
                  {groupedAppointments[date].map(appointment => (
                    <Card 
                      key={appointment._id} 
                      className={`cursor-pointer hover:shadow-md transition-shadow ${(user.role === 'admin' || user.canModifyAppointments) ? 'hover:bg-gray-50' : ''}`}
                      onClick={() => (user.role === 'admin' || user.canModifyAppointments) && handleEditAppointment(appointment)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium">{appointment.time}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium">
                              {appointment.clientName} {appointment.clientLastName}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{appointment.clientPhone}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm text-gray-700">
                            <strong>Servicio:</strong> {appointment.service}
                          </div>

                          <div className="text-sm text-gray-700">
                            <strong>Peluquero:</strong> {appointment.hairdresserName}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{appointment.estimatedDuration} min</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium">${appointment.totalCost}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {appointment.additionalComments && (
                        <div className="mt-3 text-sm text-gray-600 italic border-t pt-2">
                          {appointment.additionalComments}
                        </div>
                      )}

                      {appointment.status === 'confirmed' && appointment.deposit && (
                        <div className="mt-2 text-sm text-green-600">
                          <strong>Seña:</strong> ${appointment.deposit}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Appointment Form Modal */}
      {showAppointmentForm && (
        <AppointmentForm
          appointment={editingAppointment}
          onClose={() => {
            setShowAppointmentForm(false);
            setEditingAppointment(undefined);
          }}
          onSave={handleSaveAppointment}
          hairdressers={hairdressers}
        />
      )}
    </div>
  );
}
