import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import { validateToken } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const hairdresserId = searchParams.get('hairdresserId');

    let query: any = {};
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    if (hairdresserId) {
      query.hairdresserId = hairdresserId;
    }

    // If user is not admin, only show their appointments
    if (payload.role !== 'admin') {
      query.hairdresserId = payload.userId;
    }

    const appointments = await Appointment.find(query).sort({ date: 1, time: 1 });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    if (payload.role !== 'admin' && !payload.canCreateAppointments) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const appointmentData = await request.json();
    
    const appointment = new Appointment({
      ...appointmentData,
      createdBy: payload.userId,
    });

    await appointment.save();

    return NextResponse.json({ 
      message: 'Appointment created successfully',
      appointment 
    }, { status: 201 });
  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
