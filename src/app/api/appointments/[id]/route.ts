import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import { validateToken } from '@/lib/auth';

export const runtime = 'nodejs';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = validateToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check permissions
    if (payload.role !== 'admin' && !payload.canModifyAppointments) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const appointmentData = await request.json();
    
    const appointment = await Appointment.findByIdAndUpdate(
      params.id,
      appointmentData,
      { new: true }
    );

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Appointment updated successfully',
      appointment 
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = validateToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check permissions
    if (payload.role !== 'admin' && !payload.canModifyAppointments) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const appointment = await Appointment.findByIdAndDelete(params.id);

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
