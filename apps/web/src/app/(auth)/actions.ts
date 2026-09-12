'use server';

/**
 * Acciones de sesión: entrar, crear cuenta y salir.
 *
 * Son acciones de servidor a propósito. Las credenciales no pasan por el
 * paquete que se descarga al navegador, y acá sí se pueden escribir las cookies
 * de sesión: un componente de servidor no puede.
 */

import { redirect } from 'next/navigation';

import type { AuthState } from '@/lib/auth-state';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/** Sólo destinos internos: un destino con host propio es una redirección abierta. */
function destinoSeguro(next: FormDataEntryValue | null): string {
  if (typeof next !== 'string') return '/radar';
  if (!next.startsWith('/') || next.startsWith('//')) return '/radar';
  return next;
}

function leer(formData: FormData, campo: string): string {
  return String(formData.get(campo) ?? '').trim();
}

export async function iniciarSesion(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = leer(formData, 'email');
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Ingresá tu email y tu contraseña.', aviso: null };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Mensaje genérico a propósito: no confirmamos si un email existe.
    // La excepción es el mail sin confirmar, porque ahí el usuario no puede
    // hacer nada por su cuenta y necesita saber a quién pedirle el alta.
    const sinConfirmar = error.message.toLowerCase().includes('not confirmed');
    return {
      error: sinConfirmar
        ? 'Tu cuenta existe pero el email no está confirmado. Pedile a un administrador que la habilite.'
        : 'No pudimos iniciar sesión. Revisá el email y la contraseña.',
      aviso: null,
    };
  }

  redirect(destinoSeguro(formData.get('next')));
}

export async function crearCuenta(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = leer(formData, 'email');
  const password = String(formData.get('password') ?? '');
  const repetir = String(formData.get('password_repetir') ?? '');

  if (!email || !password) {
    return { error: 'Ingresá tu email y una contraseña.', aviso: null };
  }
  if (password.length < 8) {
    return { error: 'La contraseña necesita al menos 8 caracteres.', aviso: null };
  }
  if (password !== repetir) {
    return { error: 'Las dos contraseñas no coinciden.', aviso: null };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message, aviso: null };
  }

  // Con la confirmación por email apagada, el alta ya devuelve sesión y se
  // entra derecho. Si está prendida, no hay sesión: se avisa en vez de dejar
  // al usuario en una pantalla que no explica nada.
  if (data.session) {
    redirect(destinoSeguro(formData.get('next')));
  }

  const reintento = await supabase.auth.signInWithPassword({ email, password });
  if (!reintento.error) {
    redirect(destinoSeguro(formData.get('next')));
  }

  return {
    error: null,
    aviso:
      'Creamos la cuenta, pero este proyecto todavía exige confirmar el email. ' +
      'Un administrador tiene que habilitarla para que puedas entrar.',
  };
}

export async function recuperarAcceso(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = leer(formData, 'email');
  if (!email) return { error: 'Ingresá tu email.', aviso: null };

  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(email);

  // Respuesta siempre igual, haya o no una cuenta con ese email: la diferencia
  // sería una forma de averiguar quién está registrado.
  return {
    error: null,
    aviso:
      'Si hay una cuenta con ese email, sale un enlace para restablecer la contraseña. ' +
      'Mientras el proyecto no tenga servidor de correo propio, el mail puede no llegar: ' +
      'en ese caso pedile el restablecimiento a un administrador.',
  };
}

export async function cerrarSesion(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}
