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
    const period = searchParams.get('period') || 'month'; // day, week, month

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    let query: any = { date: { $gte: startDate } };
    
    // If user is not admin, only show their appointments
    if (payload.role !== 'admin') {
      query.hairdresserId = payload.userId;
    }

    const appointments = await Appointment.find(query);

    const stats = {
      total: appointments.length,
      confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
      pending: appointments.filter(apt => apt.status === 'pending').length,
      completed: appointments.filter(apt => apt.status === 'completed').length,
      cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
      totalRevenue: appointments
        .filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => sum + apt.totalCost, 0),
      totalDeposits: appointments
        .filter(apt => apt.status === 'confirmed' && apt.deposit)
        .reduce((sum, apt) => sum + (apt.deposit || 0), 0),
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
