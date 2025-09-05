import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return NextResponse.json({ message: 'Admin user already exists' });
    }

    // Create default admin user
    const hashedPassword = await hashPassword('admin123');
    
    const adminUser = new User({
      name: 'Administrador',
      email: 'admin@peluqueria.com',
      password: hashedPassword,
      role: 'admin',
      canCreateAppointments: true,
      canModifyAppointments: true,
    });

    await adminUser.save();

    // Create a sample hairdresser
    const hairdresserPassword = await hashPassword('peluquero123');
    
    const hairdresserUser = new User({
      name: 'María García',
      email: 'maria@peluqueria.com',
      password: hairdresserPassword,
      role: 'hairdresser',
      canCreateAppointments: true,
      canModifyAppointments: true,
    });

    await hairdresserUser.save();

    return NextResponse.json({ 
      message: 'Database initialized successfully',
      adminCredentials: {
        email: 'admin@peluqueria.com',
        password: 'admin123'
      },
      hairdresserCredentials: {
        email: 'maria@peluqueria.com',
        password: 'peluquero123'
      }
    });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
