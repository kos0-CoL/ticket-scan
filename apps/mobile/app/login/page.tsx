'use client';

import { useState } from 'react';
import { createBrowserSupabaseClient } from '../../lib/supabase';
import { Button, Input, Card, CardContent, CardHeader } from '@ticketscan/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/tickets';
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(errorParam || '');
  const [isMagicLink, setIsMagicLink] = useState(false);

  const supabase = createBrowserSupabaseClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push(redirectTo);
      router.refresh();
    }
    setLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setError('Revisa tu email para el enlace mágico');
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
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
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12 pb-safe">
      <Card elevated className="w-full max-w-md">
        <CardHeader title="TicketScan" subtitle={isMagicLink ? 'Enlace mágico' : 'Iniciar sesión'} className="text-center" />
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={isMagicLink ? handleMagicLink : handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />
            {!isMagicLink && (
              <Input
                label="Contraseña"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            )}

            <Button type="submit" fullWidth loading={loading}>
              {isMagicLink ? 'Enviar enlace mágico' : 'Entrar'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-slate-500">o</span>
            </div>
          </div>

          <Button
            variant="secondary"
            fullWidth
            onClick={() => setIsMagicLink(!isMagicLink)}
            disabled={loading}
          >
            {isMagicLink ? 'Volver a contraseña' : 'Enlace mágico por email'}
          </Button>

          <p className="text-center text-sm text-slate-500">
            ¿No tienes cuenta?{' '}
            <button
              onClick={() => router.push(`/register?redirect=${redirectTo}`)}
              className="text-primary font-medium hover:underline"
            >
              Regístrate
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}