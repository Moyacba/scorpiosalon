import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, createToken } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { name, email, password, role, canCreateAppointments, canModifyAppointments } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password and role are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (!['admin', 'hairdresser'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be admin or hairdresser' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      canCreateAppointments: role === 'admin' ? true : (canCreateAppointments || false),
      canModifyAppointments: role === 'admin' ? true : (canModifyAppointments || false),
    });

    await user.save();

    // Create token for the new user (auto-login after registration)
    const token = createToken(user);

    const response = NextResponse.json({
      message: 'Usuario creado exitosamente',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        canCreateAppointments: user.canCreateAppointments,
        canModifyAppointments: user.canModifyAppointments,
      },
    }, { status: 201 });

    // Set token cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: false, // Simplificado para desarrollo
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
