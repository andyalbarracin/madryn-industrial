'use client';

import type { CamaraAmbiente } from '@/lib/radar';

/**
 * Cámara pública: ubicación y, si el organismo la transmite, su video.
 *
 * El video se muestra **con el reproductor oficial de la plataforma**, dentro de
 * un marco incrustado. No se aloja ni se retransmite nada: la reproducción la
 * sirve la plataforma y las visualizaciones se le cuentan al organismo que
 * publica. Si el dueño del canal desactiva la incrustación, deja de verse — y
 * eso está bien, porque el control sigue siendo suyo.
 *
 * Nunca se extrae la dirección del flujo para reproducirlo por cuenta propia.
 * Eso saltea los términos de la plataforma y le roba la métrica a quien publica,
 * por más que técnicamente se pueda.
 */
export function PanelCamara({
  camara,
  onCerrar,
}: {
  camara: CamaraAmbiente;
  onCerrar: () => void;
}) {
  const tieneVideo = camara.embedProveedor === 'youtube' && camara.embedRef !== null;

  return (
    <aside className="mad-panel mad-panel-active absolute top-4 left-4 z-10 w-96 overflow-hidden">
      <header className="flex items-start justify-between gap-3 border-b border-mad-line px-4 py-3">
        <div className="min-w-0">
          <p className="mad-label">Cámara pública</p>
          <h2 className="mt-1 text-sm leading-snug font-medium text-mad-fg">{camara.ubicacion}</h2>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar cámara"
          className="shrink-0 text-mad-fg-faint transition-colors hover:text-mad-fg"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor">
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {tieneVideo ? (
        <div className="aspect-video w-full bg-mad-surface-inset">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${camara.embedRef}`}
            title={`Cámara en vivo: ${camara.ubicacion}`}
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="h-full w-full border-0"
          />
        </div>
      ) : (
        <p className="border-b border-mad-line px-4 py-3 text-xs leading-relaxed text-mad-fg-dim">
          Esta cámara tiene ubicación registrada pero todavía no su transmisión. Sabemos dónde está;
          no estamos mostrando lo que ve.
        </p>
      )}

      <dl className="grid grid-cols-2 gap-px bg-mad-line">
        <div className="bg-mad-surface px-4 py-2.5">
          <dt className="mad-label">Tipo</dt>
          <dd className="mt-1 text-xs text-mad-fg">{camara.tipo ?? '—'}</dd>
        </div>
        <div className="bg-mad-surface px-4 py-2.5">
          <dt className="mad-label">Coordenadas</dt>
          <dd className="mt-1 text-xs tabular-nums text-mad-fg">
            {camara.lat.toFixed(4)}, {camara.lon.toFixed(4)}
          </dd>
        </div>
      </dl>

      {camara.precision !== 'exacta' ? (
        <p className="border-t border-mad-line px-4 py-2.5 text-[11px] leading-relaxed text-mad-attention">
          Ubicación {camara.precision}: deducida del nombre del lugar, no medida por el organismo.
        </p>
      ) : null}

      {camara.fuenteUrl ? (
        <p className="border-t border-mad-line px-4 py-2.5 text-[11px] text-mad-fg-faint">
          Fuente:{' '}
          <a
            href={camara.fuenteUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-mad-highlight transition-colors hover:text-mad-fg"
          >
            organismo que publica
          </a>
        </p>
      ) : null}
    </aside>
  );
}
