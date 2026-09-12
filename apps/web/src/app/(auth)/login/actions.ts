'use server';

/**
 * Login con email + password contra Supabase Auth.
 *
 * Es un Server Action a propósito: las credenciales no pasan por el bundle del
 * navegador, y acá **sí** se pueden escribir cookies (un Server Component no).
 *
 * El usuario lo crea Andy desde el Dashboard (Authentication → Users). No hay
 * registro abierto: MADRYN es concierge, se entra por invitación.
 */

import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface LoginState {
  error: string | null;
}

/** Sólo aceptamos destinos internos: un `next` con host propio es open redirect. */
function destinoSeguro(next: FormDataEntryValue | null): string {
  if (typeof next !== 'string') return '/radar';
  if (!next.startsWith('/') || next.startsWith('//')) return '/radar';
  return next;
}

export async function iniciarSesion(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Ingresá tu email y tu contraseña.' };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Mensaje genérico a propósito: no confirmamos si el email existe.
    return { error: 'No pudimos iniciar sesión. Revisá el email y la contraseña.' };
  }

  redirect(destinoSeguro(formData.get('next')));
}

export async function cerrarSesion(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}
