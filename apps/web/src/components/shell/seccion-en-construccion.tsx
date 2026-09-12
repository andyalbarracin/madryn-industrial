import type { ReactNode } from 'react';

/**
 * Encabezado de sección + qué falta para que exista de verdad.
 *
 * Existe para cumplir la honestidad de estado: una sección vacía tiene que
 * **decir** que está vacía y por qué, no simular que hay datos. Cuando la
 * sección se construye, este componente se saca de ahí.
 */
export function SeccionEnConstruccion({
  titulo,
  proposito,
  falta,
  children,
}: {
  titulo: string;
  proposito: string;
  falta: readonly string[];
  children?: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-3xl">
      <header>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-zaire-fg">{titulo}</h1>
          <span className="rounded-sm border border-zaire-border px-1.5 py-0.5 text-[10px] tracking-wide text-zaire-fg-muted uppercase">
            en construcción
          </span>
        </div>
        <p className="mt-2 text-sm text-zaire-fg-muted">{proposito}</p>
      </header>

      <div className="mt-6 rounded-lg border border-zaire-border bg-zaire-surface p-5">
        <h2 className="text-xs font-semibold tracking-[0.12em] text-zaire-fg-muted uppercase">
          Qué falta para que esta pantalla muestre algo real
        </h2>
        <ul className="mt-3 flex flex-col gap-2">
          {falta.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-zaire-fg">
              <span aria-hidden className="text-zaire-fg-muted">
                ·
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {children}
    </section>
  );
}
