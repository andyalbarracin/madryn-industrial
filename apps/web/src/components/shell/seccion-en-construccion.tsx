/**
 * Encabezado de sección + qué falta para que exista de verdad.
 *
 * Cumple la honestidad de estado: una sección vacía tiene que **decir** que está
 * vacía y por qué, no simular que hay datos. Cuando la sección se construye,
 * este componente se saca de ahí.
 */
export function SeccionEnConstruccion({
  titulo,
  proposito,
  falta,
}: {
  titulo: string;
  proposito: string;
  falta: readonly string[];
}) {
  return (
    <div className="h-full overflow-y-auto">
      <section className="mx-auto max-w-3xl px-6 py-10">
        <header>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-medium text-mad-fg">{titulo}</h1>
            <span className="rounded-xs border border-mad-line px-1.5 py-0.5 text-[9px] tracking-[0.14em] text-mad-fg-faint uppercase">
              en construcción
            </span>
          </div>
          <p className="mt-2.5 text-sm leading-relaxed text-mad-fg-dim">{proposito}</p>
        </header>

        <div className="mad-panel mt-7">
          <h2 className="mad-label border-b border-mad-line px-5 py-3">
            Qué falta para que esta pantalla muestre algo real
          </h2>
          <ol className="divide-y divide-mad-line">
            {falta.map((item, i) => (
              <li key={item} className="flex gap-4 px-5 py-3.5 text-sm text-mad-fg">
                <span aria-hidden className="shrink-0 tabular-nums text-mad-fg-faint">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
