'use client';

import { useEffect, useState } from 'react';

import type { ItemVivo } from '@/lib/vivo';

/**
 * Marquesina inferior: contexto permanente que no compite con la pantalla.
 *
 * Se desplaza sola y se frena al pasar el puntero, para poder leer un dato sin
 * perseguirlo. La secuencia se duplica para que el ciclo no tenga costura.
 *
 * El reloj es de cliente y arranca en null: la hora del servidor y la del
 * navegador difieren, y renderizar dos valores distintos rompe la hidratación.
 */
export function Marquesina({ items }: { items: readonly ItemVivo[] }) {
  const [zulu, setZulu] = useState<string | null>(null);

  useEffect(() => {
    const tic = () => setZulu(new Date().toISOString().slice(11, 19));
    tic();
    const id = window.setInterval(tic, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (items.length === 0 && zulu === null) return null;

  const secuencia = [...items, ...items];

  return (
    <div className="flex h-8 shrink-0 items-stretch border-t border-mad-line bg-mad-surface text-[11px]">
      {/* Anclas fijas: no se desplazan porque se consultan seguido. */}
      <div className="flex shrink-0 items-center gap-3 border-r border-mad-line px-3">
        <span className="flex items-center gap-1.5 text-mad-ok">
          <span className="mad-dot" />
          <span className="text-mad-fg-dim">EN LÍNEA</span>
        </span>
        <span className="tabular-nums text-mad-fg-faint">{zulu === null ? '——:——:——' : `${zulu}Z`}</span>
      </div>

      <div className="group relative min-w-0 flex-1 overflow-hidden">
        <div className="mad-marquesina flex w-max items-center group-hover:[animation-play-state:paused]">
          {secuencia.map((item, i) => (
            <span key={`${item.clave}-${i}`} className="flex items-center gap-2 px-4">
              <span
                className={
                  item.tono === 'atencion'
                    ? 'text-mad-attention'
                    : item.tono === 'ok'
                      ? 'text-mad-ok'
                      : 'text-mad-fg-faint'
                }
              >
                <span className="mad-dot" />
              </span>
              <span className="text-mad-fg-dim">{item.etiqueta}</span>
              <span className="text-mad-fg">{item.valor}</span>
              <span aria-hidden className="ml-2 text-mad-line-strong">
                /
              </span>
            </span>
          ))}
        </div>
      </div>

      <p className="flex shrink-0 items-center border-l border-mad-line px-3 text-mad-fg-faint">
        Clima y sismos: fuentes públicas
      </p>
    </div>
  );
}
