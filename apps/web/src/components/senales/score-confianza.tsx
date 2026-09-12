/**
 * Puntaje y confianza, mostrados como lo que son: dos cosas distintas.
 *
 * El puntaje (0–100) dice qué tan atractiva parece la oportunidad. La confianza
 * (0–1) dice qué tan sólida es la evidencia detrás. Un 61 con confianza 0.41 es
 * "prometedor pero sin confirmar", y es una lectura **distinta** de un 61 con
 * 0.9. Por eso no se promedian, no se colapsan en un número y no comparten
 * representación:
 *
 *  - el puntaje es una barra continua, porque es una magnitud;
 *  - la confianza es una escala de cinco muescas, porque es una estimación
 *    gruesa y fingir precisión decimal sería mentir sobre lo que sabemos.
 *
 * Ninguno de los dos se comunica sólo con color: los dos llevan número y etiqueta.
 */

const MUESCAS = 5;

export function ScoreConfianza({
  score,
  confidence,
  compacto = false,
}: {
  score: number | null;
  confidence: number | null;
  compacto?: boolean;
}) {
  return (
    <div className={`flex items-center ${compacto ? 'gap-4' : 'gap-6'}`}>
      {/* ── Puntaje ── */}
      <div className="flex flex-col gap-1">
        <span className="mad-label text-[9px]">Puntaje</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tabular-nums text-mad-fg">
            {score === null ? '—' : score}
          </span>
          <span
            aria-hidden
            className="h-1 w-14 overflow-hidden rounded-full bg-mad-surface-inset"
          >
            <span
              className="block h-full bg-mad-score"
              style={{ width: `${score === null ? 0 : Math.max(0, Math.min(100, score))}%` }}
            />
          </span>
        </div>
      </div>

      {/* ── Confianza ── */}
      <div className="flex flex-col gap-1">
        <span className="mad-label text-[9px]">Confianza</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tabular-nums text-mad-fg">
            {confidence === null ? '—' : confidence.toFixed(2)}
          </span>
          <span aria-hidden className="flex gap-0.5">
            {Array.from({ length: MUESCAS }, (_, i) => {
              const llena = confidence !== null && confidence >= (i + 1) / MUESCAS - 0.0001;
              return (
                <span
                  key={i}
                  className={`h-3 w-1 rounded-[1px] ${
                    llena ? 'bg-mad-confidence' : 'bg-mad-surface-inset'
                  }`}
                />
              );
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
