import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from '@/lib/auth';

export const runtime = 'nodejs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const tokenData = validateToken(token);
    if (!tokenData) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Get full user data from database
    const user = await User.findById(tokenData.userId).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        canCreateAppointments: user.canCreateAppointments,
        canModifyAppointments: user.canModifyAppointments,
      },
    });
  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
