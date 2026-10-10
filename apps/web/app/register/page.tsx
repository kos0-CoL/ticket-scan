'use client';

import { useState } from 'react';
import { createBrowserSupabaseClient } from '../../lib/supabase-client';
import { Button, Input, Card, CardContent, CardHeader } from '@ticketscan/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(errorParam || '');

  const supabase = createBrowserSupabaseClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setError('Cuenta creada. Revisa tu email para confirmar.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <Card elevated className="w-full max-w-md">
        <CardHeader title="TicketScan" subtitle="Crear cuenta" className="text-center" />
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Nombre completo"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Juan Pérez"
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              autoComplete="new-password"
            />
            <Input
              label="Confirmar contraseña"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              required
              autoComplete="new-password"
            />

            <Button type="submit" fullWidth loading={loading}>
              Crear cuenta
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={() => router.push(`/login?redirect=${redirectTo}`)}
              className="text-primary font-medium hover:underline"
            >
              Inicia sesión
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50">Cargando...</div>}>
      <RegisterForm />
    </Suspense>
  );
}