'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import RegisterForm from '@/components/RegisterForm';
import Image from 'next/image';
import scorpioLogo from '@/assets/scorpioLogo.jpg';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/profile');
        if (response.ok) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      } catch (error) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful, redirecting to dashboard');
        // Force a page reload to ensure middleware picks up the new cookie
        window.location.href = '/dashboard';
      } else {
        console.log('Login failed:', data);
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSuccess = () => {
    setShowRegisterForm(false);
    setError('');
    // Optionally show success message
    alert('Usuario creado exitosamente. Ahora puedes iniciar sesión.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex justify-center">
          <Image src={scorpioLogo} alt="scorpioLogo" width={180} />
        </div>
        <div className="text-center mb-8">
          {/* <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Turnero Peluquería
          </h1> */}
          <p className="text-gray-600">
            Inicia sesión para acceder al sistema
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />

            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className='flex justify-center items-center h-10 w-full'
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-3">
              ¿No tienes una cuenta?
            </p>
            <Button
              className='flex justify-center items-center h-10 w-full'
              variant="secondary"
              onClick={() => setShowRegisterForm(true)}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Crear Nuevo Usuario
            </Button>
          </div>
        </Card>
      </div>

      {/* Register Form Modal */}
      {showRegisterForm && (
        <RegisterForm
          onClose={() => setShowRegisterForm(false)}
          onSuccess={handleRegisterSuccess}
        />
      )}
    </div>
  );
}
