'use client';

import { useActionState } from 'react';

import { recuperarAcceso } from '@/app/(auth)/actions';
import { ESTADO_AUTH_INICIAL } from '@/lib/auth-state';
import { BotonEnviar, Campo, Mensaje } from '@/components/auth/campos';

export function RecoveryForm() {
  const [state, formAction, pendiente] = useActionState(recuperarAcceso, ESTADO_AUTH_INICIAL);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Campo
        etiqueta="Email"
        nombre="email"
        tipo="email"
        autoComplete="email"
        placeholder="nombre@empresa.com"
      />

      {state.error ? <Mensaje tono="error">{state.error}</Mensaje> : null}
      {state.aviso ? <Mensaje tono="aviso">{state.aviso}</Mensaje> : null}

      <BotonEnviar pendiente={pendiente}>Enviar enlace</BotonEnviar>
    </form>
  );
}
