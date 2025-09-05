import bcrypt from 'bcryptjs';
import { IUser } from '@/models/User';

export interface TokenData {
  userId: string;
  email: string;
  role: 'admin' | 'hairdresser';
  canCreateAppointments: boolean;
  canModifyAppointments: boolean;
}

// Simple JWT secret - en producción usar variable de entorno
const JWT_SECRET = 'mi-secreto-super-simple-para-jwt-2024';

export function createToken(user: IUser): string {
  const payload: TokenData = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    canCreateAppointments: user.canCreateAppointments,
    canModifyAppointments: user.canModifyAppointments,
  };

  // JWT simple: header.payload.signature
  const header = btoa(JSON.stringify({ typ: 'JWT', alg: 'HS256' }));
  const payloadB64 = btoa(JSON.stringify(payload));
  
  // Simple signature (no usar en producción real)
  const signature = btoa(JWT_SECRET + header + payloadB64).replace(/[^A-Za-z0-9]/g, '').substring(0, 32);
  
  const token = `${header}.${payloadB64}.${signature}`;
  console.log('Token created for user:', user.email);
  return token;
}

export function validateToken(token: string): TokenData | null {
  try {
    if (!token) {
      console.log('No token provided');
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('Invalid token format');
      return null;
    }

    const [header, payload, signature] = parts;
    
    // Verificar signature simple
    const expectedSignature = btoa(JWT_SECRET + header + payload).replace(/[^A-Za-z0-9]/g, '').substring(0, 32);
    if (signature !== expectedSignature) {
      console.log('Invalid token signature');
      return null;
    }

    const tokenData = JSON.parse(atob(payload)) as TokenData;
    console.log('Token valid for user:', tokenData.email);
    return tokenData;
  } catch (error) {
    console.log('Token validation error:', error);
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
