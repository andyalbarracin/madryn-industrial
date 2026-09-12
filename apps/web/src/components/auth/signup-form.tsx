'use client';

import { useActionState } from 'react';

import { crearCuenta } from '@/app/(auth)/actions';
import { ESTADO_AUTH_INICIAL } from '@/lib/auth-state';
import { BotonEnviar, Campo, CampoPassword, Mensaje } from '@/components/auth/campos';

export function SignupForm({ next }: { next: string }) {
  const [state, formAction, pendiente] = useActionState(crearCuenta, ESTADO_AUTH_INICIAL);

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

      <CampoPassword etiqueta="Contraseña" nombre="password" autoComplete="new-password" />
      <CampoPassword
        etiqueta="Repetir contraseña"
        nombre="password_repetir"
        autoComplete="new-password"
      />

      <p className="text-[11px] leading-relaxed text-mad-fg-faint">
        Al menos 8 caracteres. La cuenta queda creada pero sin acceso a ningún espacio de trabajo
        hasta que un administrador te asigne uno.
      </p>

      {state.error ? <Mensaje tono="error">{state.error}</Mensaje> : null}
      {state.aviso ? <Mensaje tono="aviso">{state.aviso}</Mensaje> : null}

      <BotonEnviar pendiente={pendiente}>Crear cuenta</BotonEnviar>
    </form>
  );
}
