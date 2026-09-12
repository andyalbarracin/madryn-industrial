import Link from 'next/link';
import { notFound } from 'next/navigation';

import { requireUser } from '@/lib/dal';
import { getDetalleEntidad } from '@/lib/entidades';
import { isFeatureEnabled } from '@/lib/features';

export const metadata = { title: 'Entidad — MADRYN' };

/** Fechas legibles sin biblioteca: sólo hace falta el día. */
function fecha(iso: string | null): string {
  if (iso === null) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-AR');
}

const AFIRMACION: Record<string, string> = {
  hecho_de_fuente: 'Hecho de fuente',
  resultado_confirmado: 'Resultado confirmado',
  inferencia: 'Inferencia',
  prediccion: 'Predicción',
  recomendacion: 'Recomendación',
  opinion_humana: 'Opinión humana',
};

export default async function EntidadPage({ params }: PageProps<'/entidades/[id]'>) {
  if (!isFeatureEnabled('entidades')) notFound();
  await requireUser();

  const { id } = await params;
  const detalle = await getDetalleEntidad(id);
  if (detalle === null) notFound();

  const { entidad, eventos, relaciones, bases } = detalle;
  const vigentes = relaciones.filter((r) => r.hasta === null);
  const cerradas = relaciones.filter((r) => r.hasta !== null);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-6">
        <Link
          href="/entidades"
          className="text-xs text-mad-fg-faint transition-colors hover:text-mad-highlight"
        >
          ← Entidades
        </Link>

        <header className="mt-3 flex flex-wrap items-start justify-between gap-4 border-b border-mad-line pb-5">
          <div>
            <p className="mad-label">{entidad.tipo}</p>
            <h1 className="mt-1.5 text-2xl font-medium text-mad-fg">{entidad.nombre}</h1>
            <p className="mt-1.5 flex items-center gap-3 text-xs text-mad-fg-dim">
              <span className={entidad.status === 'activa' ? 'text-mad-ok' : 'text-mad-fg-faint'}>
                <span className="mad-dot mr-1.5" />
                {entidad.status}
              </span>
              <span>{entidad.provincia ?? 'sin provincia'}</span>
              {entidad.cuenca ? <span>Cuenca {entidad.cuenca}</span> : null}
            </p>
          </div>

          {entidad.esDemo ? (
            <p className="mad-panel max-w-xs px-3 py-2 text-[11px] leading-relaxed text-mad-attention">
              Entidad sembrada para demostración. El nombre es real; las coordenadas son aproximadas
              y los identificadores fiscales, ficticios.
            </p>
          ) : null}
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* ── Línea de tiempo ──────────────────────────────────────────── */}
          <section>
            <h2 className="mad-label">Línea de tiempo</h2>
            {eventos.length === 0 ? (
              <p className="mad-panel mt-3 px-4 py-3 text-xs text-mad-fg-faint">
                Sin eventos registrados. Los eventos se escriben con cada ingesta; un asiento
                histórico no se edita nunca.
              </p>
            ) : (
              <ol className="mt-3 border-l border-mad-line">
                {eventos.map((evento) => (
                  <li key={evento.id} className="relative pb-5 pl-5">
                    <span className="absolute top-1.5 -left-[3px] h-1.5 w-1.5 rounded-full bg-mad-accent" />
                    <p className="text-xs tabular-nums text-mad-fg-faint">
                      {fecha(evento.ocurridoEn)}
                    </p>
                    <p className="mt-0.5 text-sm text-mad-fg">
                      {evento.descripcion ?? evento.tipo}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-mad-fg-faint">
                      <span>{evento.tipo}</span>
                      <span
                        className={
                          evento.claimKind === 'hecho_de_fuente' ||
                          evento.claimKind === 'resultado_confirmado'
                            ? 'text-mad-ok'
                            : 'text-mad-attention'
                        }
                      >
                        {AFIRMACION[evento.claimKind] ?? evento.claimKind}
                      </span>
                      {evento.publicadoEn ? (
                        <span>Publicado {fecha(evento.publicadoEn)}</span>
                      ) : null}
                    </p>
                  </li>
                ))}
              </ol>
            )}

            {/* ── Relaciones ─────────────────────────────────────────────── */}
            <h2 className="mad-label mt-8">Relaciones</h2>
            {relaciones.length === 0 ? (
              <p className="mad-panel mt-3 px-4 py-3 text-xs text-mad-fg-faint">Sin relaciones.</p>
            ) : (
              <div className="mad-panel mt-3">
                <ul className="divide-y divide-mad-line">
                  {[...vigentes, ...cerradas].map((rel) => (
                    <li key={rel.id} className="flex items-center justify-between gap-4 px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="text-sm text-mad-fg">
                          <span className="text-mad-fg-faint">
                            {rel.esOrigen ? `${rel.tipo} →` : `← ${rel.tipo}`}
                          </span>{' '}
                          <Link
                            href={`/entidades/${rel.otraId}`}
                            className="transition-colors hover:text-mad-highlight"
                          >
                            {rel.otra}
                          </Link>
                        </p>
                        {rel.notas ? (
                          <p className="mt-0.5 text-[11px] text-mad-fg-faint">{rel.notas}</p>
                        ) : null}
                      </div>
                      <p className="shrink-0 text-right text-[11px] tabular-nums text-mad-fg-faint">
                        {rel.hasta === null ? (
                          <span className="text-mad-ok">vigente</span>
                        ) : (
                          <span>cerrada {fecha(rel.hasta)}</span>
                        )}
                        <span className="block">desde {fecha(rel.desde)}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* ── Encaje geográfico ────────────────────────────────────────── */}
          <aside>
            <h2 className="mad-label">Ubicación</h2>
            <div className="mad-panel mt-3 px-4 py-3">
              <p className="text-xs tabular-nums text-mad-fg">
                {entidad.lat === null || entidad.lon === null
                  ? 'Sin coordenadas cargadas'
                  : `${entidad.lat.toFixed(4)}, ${entidad.lon.toFixed(4)}`}
              </p>
            </div>

            <h2 className="mad-label mt-6">Distancia a tus bases</h2>
            {bases.length === 0 ? (
              <p className="mad-panel mt-3 px-4 py-3 text-[11px] leading-relaxed text-mad-fg-faint">
                Sin bases cargadas o sin coordenadas. El encaje geográfico del puntaje necesita las
                dos cosas.
              </p>
            ) : (
              <div className="mad-panel mt-3">
                <ul className="divide-y divide-mad-line">
                  {bases.map((base) => (
                    <li key={base.nombre} className="px-4 py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-xs text-mad-fg">{base.nombre}</span>
                        <span className="text-sm tabular-nums text-mad-fg">
                          {Math.round(base.km)} km
                        </span>
                      </div>
                      <p
                        className={`mt-1 text-[11px] ${
                          base.dentro ? 'text-mad-ok' : 'text-mad-fg-faint'
                        }`}
                      >
                        <span className="mad-dot mr-1.5" />
                        {base.dentro
                          ? `Dentro del radio comercial (${base.radioKm} km)`
                          : `Fuera del radio de ${base.radioKm} km`}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-3 text-[11px] leading-relaxed text-mad-fg-faint">
              La distancia se calcula con la misma función pura que alimenta el encaje geográfico del
              puntaje. Si diera distinto acá que en una señal, uno de los dos estaría mintiendo.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
