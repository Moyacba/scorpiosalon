import React from 'react';
import { Clock, User, Phone, DollarSign } from 'lucide-react';
import Card from '@/components/ui/Card';
import { IAppointment } from '@/models/Appointment';

interface AppointmentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  appointment: IAppointment;
  onEdit?: (appointment: IAppointment) => void;
  canEdit?: boolean;
}

export default function AppointmentCard({ 
  appointment, 
  onEdit, 
  canEdit = false,
  ...props
}: AppointmentCardProps) {
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

  const cardHeight = `${Math.max(appointment.estimatedDuration / 15, 4) * 1.5}rem`;

  const handleClick = () => {
    console.log('AppointmentCard clicked:', {
      canEdit,
      onEdit: !!onEdit,
      appointmentId: appointment._id
    });
    
    if (canEdit && onEdit) {
      onEdit(appointment);
    }
  };

  return (
    <Card 
      className={`mb-2 cursor-pointer hover:shadow-md transition-shadow ${canEdit ? 'hover:bg-gray-50' : ''}`}
      style={{ minHeight: cardHeight, ...props.style }}
      onClick={handleClick}
      {...props}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">{appointment.time}</span>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
          {getStatusText(appointment.status)}
        </span>
      </div>

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

        {appointment.additionalComments && (
          <div className="text-sm text-gray-600 italic">
            {appointment.additionalComments}
          </div>
        )}

        {appointment.status === 'confirmed' && appointment.deposit && (
          <div className="text-sm text-green-600">
            <strong>Seña:</strong> ${appointment.deposit}
          </div>
        )}
      </div>
    </Card>
  );
}
