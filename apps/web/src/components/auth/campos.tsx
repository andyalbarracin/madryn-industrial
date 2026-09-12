'use client';

import { useId, useState } from 'react';

/**
 * Campos de los formularios de acceso.
 *
 * Estilo de instrumento: superficie hundida, línea fina, radio bajo, y el borde
 * se enciende en azul al enfocar. Sin sombras ni cristal.
 */

const CLASES_INPUT =
  'w-full rounded-mad border border-mad-line bg-mad-surface-inset px-3 py-2.5 text-sm text-mad-fg ' +
  'placeholder:text-mad-fg-faint outline-none transition-colors ' +
  'focus:border-mad-accent focus:ring-1 focus:ring-mad-accent/35';

export function Campo({
  etiqueta,
  nombre,
  tipo = 'text',
  autoComplete,
  placeholder,
  requerido = true,
}: {
  etiqueta: string;
  nombre: string;
  tipo?: string;
  autoComplete?: string;
  placeholder?: string;
  requerido?: boolean;
}) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-mad-fg-dim">
        {etiqueta}
      </label>
      <input
        id={id}
        name={nombre}
        type={tipo}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={requerido}
        className={CLASES_INPUT}
      />
    </div>
  );
}

export function CampoPassword({
  etiqueta,
  nombre,
  autoComplete,
  accesorio,
}: {
  etiqueta: string;
  nombre: string;
  autoComplete: string;
  /** Enlace opcional a la derecha de la etiqueta, como "¿Olvidaste tu contraseña?". */
  accesorio?: React.ReactNode;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-xs font-medium text-mad-fg-dim">
          {etiqueta}
        </label>
        {accesorio}
      </div>

      <div className="relative">
        <input
          id={id}
          name={nombre}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          className={`${CLASES_INPUT} pr-10`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-mad-fg-faint transition-colors hover:text-mad-fg-dim"
        >
          <svg viewBox="0 0 20 20" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M1.8 10S4.9 4.6 10 4.6 18.2 10 18.2 10 15.1 15.4 10 15.4 1.8 10 1.8 10Z" />
            <circle cx="10" cy="10" r="2.4" />
            {!visible ? <path d="M3.5 3.5l13 13" strokeLinecap="round" /> : null}
          </svg>
        </button>
      </div>
    </div>
  );
}

/** Botón principal de los formularios de acceso. */
export function BotonEnviar({ pendiente, children }: { pendiente: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pendiente}
      className="mt-1 rounded-mad bg-mad-accent px-4 py-2.5 text-sm font-medium text-[#06101F] transition-colors hover:bg-mad-highlight disabled:cursor-not-allowed disabled:opacity-55"
    >
      {pendiente ? 'Verificando…' : children}
    </button>
  );
}

/** Mensaje de error o de aviso. El color nunca comunica solo: hay ícono y texto. */
export function Mensaje({ tono, children }: { tono: 'error' | 'aviso'; children: React.ReactNode }) {
  const esError = tono === 'error';
  return (
    <p
      role={esError ? 'alert' : 'status'}
      className={`flex gap-2 rounded-mad border px-3 py-2.5 text-xs leading-relaxed ${
        esError
          ? 'border-mad-alert/40 bg-mad-alert/8 text-mad-alert'
          : 'border-mad-line-active bg-mad-accent/8 text-mad-highlight'
      }`}
    >
      <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      <span>{children}</span>
    </p>
  );
}
