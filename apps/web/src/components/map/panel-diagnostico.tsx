'use client';

import { useState } from 'react';

import type { Diagnostico } from '@/lib/radar';

/**
 * Qué falta para que la pantalla muestre datos, dicho sin rodeos.
 *
 * Existe porque el silencio es el peor diagnóstico: una lista vacía con una
 * frase genérica manda a buscar el problema al lugar equivocado. Acá se dice el
 * motivo real y qué hacer, y se puede cerrar para ver el mapa igual.
 */
export function PanelDiagnostico({ diagnosticos }: { diagnosticos: readonly Diagnostico[] }) {
  const [cerrado, setCerrado] = useState(false);

  if (diagnosticos.length === 0 || cerrado) return null;

  return (
    <aside className="mad-panel absolute top-4 left-1/2 z-10 w-[min(34rem,calc(100%-2rem))] -translate-x-1/2 border-mad-line-active">
      <header className="flex items-center justify-between gap-3 border-b border-mad-line px-4 py-2.5">
        <p className="mad-label text-mad-attention">
          Falta configurar {diagnosticos.length === 1 ? 'una cosa' : `${diagnosticos.length} cosas`}
        </p>
        <button
          type="button"
          onClick={() => setCerrado(true)}
          aria-label="Cerrar diagnóstico"
          className="text-mad-fg-faint transition-colors hover:text-mad-fg"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor">
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <ol className="divide-y divide-mad-line">
        {diagnosticos.map((d) => (
          <li key={d.titulo} className="px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-medium text-mad-fg">
              <span
                aria-hidden
                className={`mad-dot ${d.nivel === 'error' ? 'text-mad-alert' : 'text-mad-attention'}`}
              />
              {d.titulo}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-mad-fg-dim">{d.detalle}</p>
            <p className="mt-2 rounded-mad bg-mad-surface-inset px-3 py-2 text-xs text-mad-highlight">
              {d.accion}
            </p>
          </li>
        ))}
      </ol>
    </aside>
  );
}
