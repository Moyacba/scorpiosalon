import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // API routes that don't require authentication
  const publicApiRoutes = ['/api/auth/login', '/api/auth/register'];
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // Check if token exists
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Validate token
  const tokenData = validateToken(token);
  
  if (!tokenData) {
    const response = pathname.startsWith('/api/') 
      ? NextResponse.json({ error: 'Token inválido' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));
    
    if (!pathname.startsWith('/api/')) {
      response.cookies.delete('auth-token');
    }
    return response;
  }

  // Role-based access control
  if (pathname.startsWith('/admin') && tokenData.role !== 'admin') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
  runtime: 'nodejs',
};
