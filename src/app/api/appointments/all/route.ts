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
    // Validate authentication
    const payload = validateToken(token);
    if (!payload || (payload.role !== 'admin' && payload.role !== 'hairdresser')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const status = searchParams.get('status');

    // Build filter object
    const filter: any = {};
    
    if (fromDate) {
      filter.date = { ...filter.date, $gte: new Date(fromDate) };
    }
    
    if (toDate) {
      filter.date = { ...filter.date, $lte: new Date(toDate) };
    }
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Get filtered appointments sorted by date and time
    const appointments = await Appointment.find(filter)
      .sort({ date: 1, time: 1 })
      .lean();

    return NextResponse.json({
      appointments,
      total: appointments.length
    });

  } catch (error) {
    console.error('Error fetching all appointments:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
