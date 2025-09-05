'use client';

import React, { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';
import AppointmentCard from '@/components/AppointmentCard';
import { IAppointment } from '@/models/Appointment';

interface TimelineCalendarProps {
  onCreateAppointment: (date?: string, time?: string, hairdresserId?: string) => void;
  onEditAppointment: (appointment: IAppointment) => void;
  canCreateAppointments: boolean;
  canModifyAppointments: boolean;
  hairdressers: Array<{ id: string; name: string }>;
}

export default function TimelineCalendar({
  onCreateAppointment,
  onEditAppointment,
  canCreateAppointments,
  canModifyAppointments,
  hairdressers,
}: TimelineCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [loading, setLoading] = useState(false);

  const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const hour = i + 7; // Start at 7 AM, end at 12 AM (24:00/00:00)
    return `${(hour % 24).toString().padStart(2, '0')}:00`;
  });

  const fetchAppointments = async (date: Date) => {
    setLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await fetch(`/api/appointments?date=${dateStr}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(selectedDate);
  }, [selectedDate]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = addDays(selectedDate, direction === 'next' ? 1 : -1);
    setSelectedDate(newDate);
  };

  const getAppointmentsForTimeSlotAndHairdresser = (timeSlot: string, hairdresserId: string) => {
    return appointments.filter(apt => {
      const aptTime = apt.time.substring(0, 5); // Get HH:MM format
      return aptTime === timeSlot && apt.hairdresserId === hairdresserId;
    });
  };

  const isTimeSlotOccupiedByHairdresser = (timeSlot: string, hairdresserId: string) => {
    const slotHour = parseInt(timeSlot.split(':')[0]);
    return appointments.some(apt => {
      if (apt.hairdresserId !== hairdresserId) return false;
      const aptHour = parseInt(apt.time.split(':')[0]);
      const aptEndHour = aptHour + Math.ceil(apt.estimatedDuration / 60);
      return slotHour >= aptHour && slotHour < aptEndHour;
    });
  };

  const getAppointmentAtTimeSlot = (timeSlot: string, hairdresserId: string) => {
    const slotHour = parseInt(timeSlot.split(':')[0]);
    return appointments.find(apt => {
      if (apt.hairdresserId !== hairdresserId) return false;
      const aptHour = parseInt(apt.time.split(':')[0]);
      const aptStartTime = apt.time.substring(0, 5);
      return aptStartTime === timeSlot;
    });
  };

  // Determine if we need horizontal scroll or full width
  const isSingleHairdresser = hairdressers.length === 1;
  const containerStyle = isSingleHairdresser 
    ? { width: '100%' }
    : { width: `${64 + (hairdressers.length * 280)}px` };
  const timelineStyle = isSingleHairdresser 
    ? { width: '100%' }
    : { width: `${64 + (hairdressers.length * 280)}px` };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="mb-4">
          {/* <h1 className="text-xl font-bold text-gray-900">Agenda</h1> */}
          <div className="flex items-center justify-between">
            <Button 
              className='flex justify-center items-center h-10' 
              variant="secondary" 
              size="sm"
              onClick={() => window.location.href = '/appointments'}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Todos los turnos
            </Button>
            {canCreateAppointments && (
              <Button className='flex justify-center items-center h-10' onClick={onCreateAppointment} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Nuevo Turno
              </Button>
            )}
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="secondary" className='flex justify-center items-center h-10' size="sm" onClick={() => navigateDate('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {format(selectedDate, 'EEEE, d MMMM', { locale: es })}
            </h2>
            <p className="text-sm text-gray-600">
              {format(selectedDate, 'yyyy')}
            </p>
          </div>

          <Button variant="secondary" className='flex justify-center items-center h-10' size="sm" onClick={() => navigateDate('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className={`flex-1 p-4 ${isSingleHairdresser ? 'overflow-y-auto' : 'overflow-auto'}`}>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div style={containerStyle}>
            {/* Header with hairdresser names */}
            <div className="flex mb-4 sticky top-0 bg-gray-50 z-10 pb-2">
              <div className="w-16 flex-shrink-0"></div>
              {hairdressers.map((hairdresser) => (
                <div 
                  key={hairdresser.id} 
                  className={`px-2 text-center`}
                  style={isSingleHairdresser ? { flex: 1 } : { width: '620px' }}
                >
                  <div className="text-sm font-medium text-gray-700 bg-white rounded p-2 border">
                    {hairdresser.name}
                  </div>
                </div>
              ))}
            </div>

            {/* Time slots */}
            <div className="space-y-1" style={timelineStyle}>
              {timeSlots.map((timeSlot) => (
                <div key={timeSlot} className="flex items-stretch min-h-[3rem]">
                  {/* Time Label */}
                  <div className="w-16 flex-shrink-0 text-sm text-gray-500 font-medium pt-2">
                    {timeSlot}
                  </div>

                  {/* Columns for each hairdresser */}
                  {hairdressers.map((hairdresser) => {
                    const appointment = getAppointmentAtTimeSlot(timeSlot, hairdresser.id);
                    const isOccupied = isTimeSlotOccupiedByHairdresser(timeSlot, hairdresser.id);

                    return (
                      <div 
                        key={hairdresser.id} 
                        className="px-2"
                        style={isSingleHairdresser ? { flex: 1 } : { width: '620px' }}
                      >
                        {appointment ? (
                          <AppointmentCard
                            appointment={appointment}
                            onEdit={onEditAppointment}
                            canEdit={canModifyAppointments}
                            style={{
                              height: `${Math.max(appointment.estimatedDuration / 15, 20) * 0.75}rem`
                            }}
                          />
                        ) : isOccupied ? (
                          <div className="h-12 bg-gray-100 rounded border-2 border-gray-200"></div>
                        ) : (
                          <div
                            className="h-12 border-2 border-dashed border-gray-300 hover:border-primary-300 hover:bg-primary-50 cursor-pointer rounded flex items-center justify-center"
                            onClick={() => canCreateAppointments && onCreateAppointment(format(selectedDate, 'yyyy-MM-dd'), timeSlot, hairdresser.id)}
                          >
                            {canCreateAppointments && (
                              <span className="text-xs text-gray-500">
                                Disponible
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
