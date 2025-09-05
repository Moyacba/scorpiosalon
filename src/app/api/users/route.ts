import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, validateToken } from '@/lib/auth';

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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    let query: any = { isActive: true };
    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select('-password');
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
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
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, email, password, role, canCreateAppointments, canModifyAppointments } = await request.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      canCreateAppointments,
      canModifyAppointments,
    });

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({ 
      message: 'User created successfully',
      user: userResponse 
    }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
