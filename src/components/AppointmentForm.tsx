'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { IAppointment } from '@/models/Appointment';

interface AppointmentFormProps {
  appointment?: IAppointment;
  prefilledData?: { date?: string; time?: string } | null;
  onClose: () => void;
  onSave: (data: any) => void;
  hairdressers: Array<{ id: string; name: string }>;
}

interface FormData {
  clientName: string;
  clientLastName: string;
  clientPhone: string;
  hairdresserName: string;
  hairdresserId: string;
  date: string;
  time: string;
  service: string;
  estimatedDuration: number;
  totalCost: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  deposit?: number;
  additionalComments?: string;
}

export default function AppointmentForm({
  appointment,
  prefilledData,
  onClose,
  onSave,
  hairdressers,
}: AppointmentFormProps) {
  const [showDeposit, setShowDeposit] = useState(appointment?.status === 'confirmed' && !!appointment?.deposit);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: appointment ? {
      clientName: appointment.clientName,
      clientLastName: appointment.clientLastName,
      clientPhone: appointment.clientPhone,
      hairdresserName: appointment.hairdresserName,
      hairdresserId: appointment.hairdresserId,
      date: new Date(appointment.date).toISOString().split('T')[0],
      time: appointment.time,
      service: appointment.service,
      estimatedDuration: appointment.estimatedDuration,
      totalCost: appointment.totalCost,
      status: appointment.status,
      deposit: appointment.deposit,
      additionalComments: appointment.additionalComments,
    } : {
      clientName: '',
      clientLastName: '',
      clientPhone: '',
      hairdresserName: '',
      hairdresserId: '',
      date: prefilledData?.date || '',
      time: prefilledData?.time || '',
      service: '',
      estimatedDuration: 60,
      totalCost: 0,
      status: 'pending',
      additionalComments: '',
    },
  });

  const watchedStatus = watch('status');

  // Auto-fill date and time when prefilledData is provided (moved to defaultValues)

  React.useEffect(() => {
    if (watchedStatus === 'confirmed') {
      setShowDeposit(true);
    } else {
      setShowDeposit(false);
      setValue('deposit', undefined);
    }
  }, [watchedStatus, setValue]);

  const onSubmit = (data: FormData) => {
    // Debug log to see what data we're sending
    console.log('Form data being submitted:', data);
    console.log('Form errors:', errors);
    console.log('Current form values:', getValues());
    
    // Validate required fields manually
    if (!data.clientName || !data.clientLastName || !data.clientPhone || 
        !data.hairdresserId || !data.date || !data.time || 
        !data.service || !data.estimatedDuration || data.totalCost === undefined) {
      console.error('Missing required fields:', {
        clientName: !data.clientName,
        clientLastName: !data.clientLastName,
        clientPhone: !data.clientPhone,
        hairdresserId: !data.hairdresserId,
        date: !data.date,
        time: !data.time,
        service: !data.service,
        estimatedDuration: !data.estimatedDuration,
        totalCost: data.totalCost === undefined
      });
      return;
    }
    
    // Ensure numeric values are properly converted
    const processedData = {
      ...data,
      estimatedDuration: Number(data.estimatedDuration),
      totalCost: Number(data.totalCost),
      deposit: data.deposit ? Number(data.deposit) : undefined,
    };
    
    console.log('Processed data:', processedData);
    onSave(processedData);
  };

  const services = [
    'Corte',
    'Lavado y Peinado',
    'Coloración',
    'Mechas',
    'Tratamiento',
    'Peinado para Evento',
    'Corte + Lavado',
    'Coloración + Corte',
    'Otro',
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {appointment ? 'Editar Turno' : 'Nuevo Turno'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          {/* Client Information */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Datos del Cliente</h3>
            
            <Input
              label="Nombre"
              {...register('clientName', { required: 'El nombre es requerido' })}
              error={errors.clientName?.message}
            />

            <Input
              label="Apellido"
              {...register('clientLastName', { required: 'El apellido es requerido' })}
              error={errors.clientLastName?.message}
            />

            <Input
              label="Teléfono"
              type="tel"
              {...register('clientPhone', { required: 'El teléfono es requerido' })}
              error={errors.clientPhone?.message}
            />
          </div>

          {/* Hairdresser Information */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Peluquero</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peluquero <span className="text-red-500">*</span>
              </label>
              <select
                {...register('hairdresserId', { required: 'Selecciona un peluquero' })}
                className="input-field"
                onChange={(e) => {
                  const selectedHairdresser = hairdressers.find(h => h.id === e.target.value);
                  setValue('hairdresserName', selectedHairdresser?.name || '');
                  setValue('hairdresserId', e.target.value);
                }}
              >
                <option value="">Seleccionar peluquero</option>
                {hairdressers.map((hairdresser) => (
                  <option key={hairdresser.id} value={hairdresser.id}>
                    {hairdresser.name}
                  </option>
                ))}
              </select>
              {errors.hairdresserId && (
                <p className="mt-1 text-sm text-red-600">{errors.hairdresserId.message}</p>
              )}
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Detalles del Turno</h3>
            
            <Input
              label="Fecha"
              type="date"
              {...register('date', { required: 'La fecha es requerida' })}
              error={errors.date?.message}
            />

            <Input
              label="Hora"
              type="time"
              {...register('time', { required: 'La hora es requerida' })}
              error={errors.time?.message}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Servicio <span className="text-red-500">*</span>
              </label>
              <select
                {...register('service', { required: 'El servicio es requerido' })}
                className="input-field"
              >
                <option value="">Seleccionar servicio</option>
                {services.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
              {errors.service && (
                <p className="mt-1 text-sm text-red-600">{errors.service.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duración estimada <span className="text-red-500">*</span>
              </label>
              <select
                {...register('estimatedDuration', { 
                  required: 'La duración es requerida',
                  min: { value: 30, message: 'Mínimo 30 minutos' }
                })}
                className="input-field"
              >
                <option value="">Seleccionar duración</option>
                {Array.from({ length: 16 }, (_, i) => {
                  const minutes = (i + 1) * 30; // 30, 60, 90, ..., 480 (8 hours)
                  const hours = Math.floor(minutes / 60);
                  const mins = minutes % 60;
                  const displayText = hours > 0 
                    ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}`
                    : `${minutes}m`;
                  return (
                    <option key={minutes} value={minutes}>
                      {displayText}
                    </option>
                  );
                })}
              </select>
              {errors.estimatedDuration && (
                <p className="mt-1 text-sm text-red-600">{errors.estimatedDuration.message}</p>
              )}
            </div>

            <Input
              label="Costo total"
              type="number"
              min="0"
              step="0.01"
              {...register('totalCost', { 
                required: 'El costo es requerido',
                min: { value: 0, message: 'El costo debe ser positivo' }
              })}
              error={errors.totalCost?.message}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado del turno
              </label>
              <select
                {...register('status')}
                className="input-field"
              >
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmado</option>
                <option value="completed">Completado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            {showDeposit && (
              <Input
                label="Seña"
                type="number"
                min="0"
                step="0.01"
                {...register('deposit')}
                error={errors.deposit?.message}
              />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comentarios adicionales
              </label>
              <textarea
                {...register('additionalComments')}
                className="input-field"
                rows={3}
                placeholder="Comentarios opcionales..."
              />
            </div>
          </div>

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
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
