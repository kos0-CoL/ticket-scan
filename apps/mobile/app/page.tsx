'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Raíz del dashboard de usuarios: lleva a /tickets. Si no hay sesión,
// el layout raíz se encarga de mandar a /login.
export default function HomePage() {
  const router = useRouter();
  useEffect(() => { router.replace('/tickets'); }, [router]);
  return null;
}
