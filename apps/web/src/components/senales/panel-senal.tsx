'use client';

import { ScoreConfianza } from '@/components/senales/score-confianza';
import type { EvidenciaSenal, RazonSenal, SenalResumen } from '@/lib/radar';

/**
 * Panel de señal: por qué existe y qué la sostiene.
 *
 * Es la promesa central del producto hecha pantalla. Una señal se abre hasta su
 * evidencia, y cada afirmación dice de qué naturaleza es: un hecho publicado por
 * la fuente no se muestra igual que una inferencia nuestra.
 *
 * Las limitaciones se muestran junto a la evidencia, no escondidas. Un pozo
 * parado puede estarlo por precio, por mantenimiento programado o por falla, y
 * si el dato no dice el motivo, la pantalla tampoco lo va a decir.
 */

/** Cómo se nombra y se trata cada naturaleza de afirmación. */
const AFIRMACION: Record<string, { etiqueta: string; clase: string }> = {
  hecho_de_fuente: { etiqueta: 'Hecho de fuente', clase: 'text-mad-ok' },
  resultado_confirmado: { etiqueta: 'Resultado confirmado', clase: 'text-mad-ok' },
  inferencia: { etiqueta: 'Inferencia', clase: 'text-mad-attention' },
  prediccion: { etiqueta: 'Predicción', clase: 'text-mad-attention' },
  recomendacion: { etiqueta: 'Recomendación', clase: 'text-mad-fg-dim' },
  opinion_humana: { etiqueta: 'Opinión humana', clase: 'text-mad-fg-dim' },
};

export function PanelSenal({
  senal,
  razones,
  evidencias,
  onCerrar,
}: {
  senal: SenalResumen;
  razones: readonly RazonSenal[];
  evidencias: readonly EvidenciaSenal[];
  onCerrar: () => void;
}) {
  const maximo = Math.max(1, ...razones.map((r) => Math.abs(r.aporte)));

  return (
    <aside className="mad-panel mad-panel-active absolute top-4 right-4 bottom-4 z-10 flex w-96 flex-col overflow-hidden">
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-mad-line px-4 py-3">
        <div className="min-w-0">
          <p className="mad-label">Señal</p>
          <h2 className="mt-1 text-sm leading-snug font-medium text-mad-fg">{senal.titulo}</h2>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar señal"
          className="shrink-0 text-mad-fg-faint transition-colors hover:text-mad-fg"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor">
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="border-b border-mad-line px-4 py-3">
          <ScoreConfianza score={senal.score} confidence={senal.confidence} />
        </div>

        {senal.resumen ? (
          <p className="border-b border-mad-line px-4 py-3 text-xs leading-relaxed text-mad-fg-dim">
            {senal.resumen}
          </p>
        ) : null}

        {/* ── Por qué este puntaje ──────────────────────────────────────── */}
        <section className="border-b border-mad-line">
          <h3 className="mad-label px-4 pt-3">Por qué este puntaje</h3>
          {razones.length === 0 ? (
            <p className="px-4 py-3 text-xs text-mad-fg-faint">
              Esta señal no tiene desglose cargado.
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5 px-4 py-3">
              {razones.map((razon) => {
                const negativo = razon.aporte < 0;
                return (
                  <li key={`${razon.factor}-${razon.etiqueta}`}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-xs text-mad-fg">{razon.etiqueta}</span>
                      <span
                        className={`shrink-0 text-xs tabular-nums ${
                          negativo ? 'text-mad-alert' : 'text-mad-score'
                        }`}
                      >
                        {negativo ? '' : '+'}
                        {razon.aporte}
                      </span>
                    </div>
                    {/* La barra vive bajo la etiqueta: es magnitud, no adorno. */}
                    <div className="mt-1 h-0.5 w-full bg-mad-surface-inset">
                      <div
                        className={`h-full ${negativo ? 'bg-mad-alert' : 'bg-mad-score'}`}
                        style={{ width: `${(Math.abs(razon.aporte) / maximo) * 100}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ── Evidencia ─────────────────────────────────────────────────── */}
        <section>
          <h3 className="mad-label px-4 pt-3">Evidencia</h3>
          {evidencias.length === 0 ? (
            <p className="px-4 py-3 text-xs text-mad-fg-faint">
              Sin evidencia cargada. Una señal sin evidencia no debería publicarse.
            </p>
          ) : (
            <ul className="divide-y divide-mad-line">
              {evidencias.map((ev) => {
                const tipo = AFIRMACION[ev.claimKind] ?? {
                  etiqueta: ev.claimKind,
                  clase: 'text-mad-fg-dim',
                };
                return (
                  <li key={ev.id} className="px-4 py-3">
                    <p className={`flex items-center gap-1.5 text-[10px] tracking-wide uppercase ${tipo.clase}`}>
                      <span className="mad-dot" />
                      {tipo.etiqueta}
                    </p>

                    {ev.fragmento ? (
                      <p className="mt-2 border-l border-mad-line-strong pl-3 text-xs leading-relaxed text-mad-fg">
                        {ev.fragmento}
                      </p>
                    ) : null}

                    {ev.limitaciones ? (
                      <p className="mt-2 text-[11px] leading-relaxed text-mad-fg-faint">
                        <span className="text-mad-attention">Limitación: </span>
                        {ev.limitaciones}
                      </p>
                    ) : null}

                    {ev.registroRef ? (
                      <p className="mt-2 text-[10px] text-mad-fg-faint">Registro: {ev.registroRef}</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {senal.accionSugerida ? (
        <footer className="shrink-0 border-t border-mad-line px-4 py-3">
          <p className="mad-label">Acción sugerida</p>
          <p className="mt-1.5 text-xs text-mad-highlight">
            {senal.accionSugerida.replace(/_/g, ' ')}
          </p>
          <p className="mt-2 text-[10px] leading-relaxed text-mad-fg-faint">
            Sugerencia calculada, no una decisión. Se ejecuta cuando exista el registro de acciones.
          </p>
        </footer>
      ) : null}
    </aside>
  );
}
