import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  _id: string;
  // Client data
  clientName: string;
  clientLastName: string;
  clientPhone: string;
  
  // Hairdresser data
  hairdresserName: string;
  hairdresserId: string;
  
  // Appointment details
  date: Date;
  time: string;
  service: string;
  estimatedDuration: number; // in minutes
  totalCost: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  deposit?: number;
  additionalComments?: string;
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
  // Client data
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
  },
  clientLastName: {
    type: String,
    required: [true, 'Client last name is required'],
    trim: true,
  },
  clientPhone: {
    type: String,
    required: [true, 'Client phone is required'],
    trim: true,
  },
  
  // Hairdresser data
  hairdresserName: {
    type: String,
    required: [true, 'Hairdresser name is required'],
    trim: true,
  },
  hairdresserId: {
    type: String,
    required: [true, 'Hairdresser ID is required'],
  },
  
  // Appointment details
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  time: {
    type: String,
    required: [true, 'Time is required'],
  },
  service: {
    type: String,
    required: [true, 'Service is required'],
    trim: true,
  },
  estimatedDuration: {
    type: Number,
    required: [true, 'Estimated duration is required'],
    min: 30,
  },
  totalCost: {
    type: Number,
    required: [true, 'Total cost is required'],
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  deposit: {
    type: Number,
    min: 0,
  },
  additionalComments: {
    type: String,
    trim: true,
  },
  
  // Metadata
  createdBy: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
AppointmentSchema.index({ date: 1, time: 1 });
AppointmentSchema.index({ hairdresserId: 1, date: 1 });

export default mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
