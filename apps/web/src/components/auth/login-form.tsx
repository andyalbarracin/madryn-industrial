'use client';

import { useActionState } from 'react';

import { iniciarSesion, type LoginState } from '@/app/(auth)/login/actions';

const estadoInicial: LoginState = { error: null };

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(iniciarSesion, estadoInicial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-zaire-fg">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          className="rounded-md border border-zaire-border bg-zaire-surface px-3 py-2 text-zaire-fg outline-none focus-visible:border-zaire-primary focus-visible:ring-2 focus-visible:ring-zaire-primary/30"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-zaire-fg">Contraseña</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className="rounded-md border border-zaire-border bg-zaire-surface px-3 py-2 text-zaire-fg outline-none focus-visible:border-zaire-primary focus-visible:ring-2 focus-visible:ring-zaire-primary/30"
        />
      </label>

      {state.error ? (
        <p role="alert" className="text-sm text-zaire-danger">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-md bg-zaire-primary px-4 py-2 font-medium text-zaire-primary-fg transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
