'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { iniciarSesion } from '@/app/(auth)/actions';
import { ESTADO_AUTH_INICIAL } from '@/lib/auth-state';
import { BotonEnviar, Campo, CampoPassword, Mensaje } from '@/components/auth/campos';

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pendiente] = useActionState(iniciarSesion, ESTADO_AUTH_INICIAL);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <Campo
        etiqueta="Email"
        nombre="email"
        tipo="email"
        autoComplete="email"
        placeholder="nombre@empresa.com"
      />

      <CampoPassword
        etiqueta="Contraseña"
        nombre="password"
        autoComplete="current-password"
        accesorio={
          <Link
            href="/recuperar"
            className="text-xs text-mad-fg-faint transition-colors hover:text-mad-highlight"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        }
      />

      {state.error ? <Mensaje tono="error">{state.error}</Mensaje> : null}

      <BotonEnviar pendiente={pendiente}>Entrar</BotonEnviar>
    </form>
  );
}
