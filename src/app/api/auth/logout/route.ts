import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // Con JWT no necesitamos destruir sesiones en el servidor
  // Solo limpiamos la cookie del cliente
  
  const response = NextResponse.json({ message: 'Sesión cerrada exitosamente' });
  
  // Clear the auth token cookie
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
