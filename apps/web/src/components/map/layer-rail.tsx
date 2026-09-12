'use client';

import { CAPAS, type ClaveCapa } from '@/lib/capas';

/**
 * Riel de capas.
 *
 * Barra angosta de íconos: cada uno prende o apaga una capa del mapa. La capa
 * encendida se marca con las esquinas de encuadre y el ícono en azul; la apagada
 * queda en acero. El estado no se comunica sólo con color: hay marco, hay
 * `aria-pressed` y hay contador visible al costado.
 *
 * En pantallas anchas el riel muestra también la etiqueta al pasar el puntero,
 * sin desplazar nada: el panel flota sobre el mapa.
 */

const ICONOS: Record<ClaveCapa, React.ReactNode> = {
  // Señal: onda que se expande desde un nodo.
  senales: (
    <>
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      <path d="M7.5 16.5a6.4 6.4 0 0 1 0-9M16.5 7.5a6.4 6.4 0 0 1 0 9" />
    </>
  ),
  // Proyecto: hito sobre una línea de avance.
  proyectos: (
    <>
      <path d="M4 18h16" />
      <path d="M8 18V9l4-3 4 3v9" />
    </>
  ),
  // Yacimiento: área delimitada.
  yacimientos: (
    <>
      <path d="M5 8.5 12 5l7 3.5v7L12 19l-7-3.5Z" />
      <path d="M12 5v14" strokeOpacity=".45" />
    </>
  ),
  // Pozo: perforación vertical con brocal.
  pozos: (
    <>
      <path d="M6 7h12" />
      <path d="M12 7v12" />
      <path d="M9 19h6" />
    </>
  ),
  // Cámara: cuerpo con lente.
  camaras: (
    <>
      <path d="M4 8.5h11a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1Z" />
      <path d="M16 11.5 21 9v6l-5-2.5" />
      <circle cx="8" cy="12" r="1.6" />
    </>
  ),
  // Infraestructura: planta con chimeneas.
  infraestructura: (
    <>
      <path d="M4 19V11l5 3V11l5 3V8h6v11Z" />
    </>
  ),
};

interface Props {
  activas: readonly ClaveCapa[];
  conteos: Readonly<Record<ClaveCapa, number>>;
  onAlternar: (clave: ClaveCapa) => void;
}

export function LayerRail({ activas, conteos, onAlternar }: Props) {
  const encendidas = new Set(activas);

  return (
    <nav
      aria-label="Capas del mapa"
      className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-mad-line bg-mad-surface py-3"
    >
      <p className="mad-label mb-2 text-[9px]">Capas</p>

      {CAPAS.map((capa) => {
        const activa = encendidas.has(capa.clave);
        const cantidad = conteos[capa.clave] ?? 0;

        return (
          <button
            key={capa.clave}
            type="button"
            onClick={() => onAlternar(capa.clave)}
            aria-pressed={activa}
            title={`${capa.etiqueta} · ${capa.descripcion} · ${cantidad}`}
            className={`group relative flex h-11 w-11 items-center justify-center rounded-mad border transition-colors ${
              activa
                ? 'border-mad-line-active bg-mad-accent/10 text-mad-accent'
                : 'border-transparent text-mad-fg-faint hover:border-mad-line hover:text-mad-fg-dim'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {ICONOS[capa.clave]}
            </svg>

            {/* Cantidad: el dato que hace útil prender o apagar la capa. */}
            <span
              className={`absolute right-0.5 bottom-0.5 text-[9px] tabular-nums ${
                activa ? 'text-mad-highlight' : 'text-mad-fg-faint'
              }`}
            >
              {cantidad > 999 ? '999+' : cantidad}
            </span>

            {/* Etiqueta emergente. */}
            <span className="pointer-events-none absolute left-full z-20 ml-2 hidden whitespace-nowrap rounded-mad border border-mad-line bg-mad-surface-raised px-2.5 py-1.5 text-xs text-mad-fg group-hover:block">
              {capa.etiqueta}
              <span className="ml-2 text-mad-fg-faint">{cantidad}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
