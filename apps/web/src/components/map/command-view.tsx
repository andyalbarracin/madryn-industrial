'use client';

import { useMemo, useState } from 'react';

import { LayerRail } from '@/components/map/layer-rail';
import { PanelDiagnostico } from '@/components/map/panel-diagnostico';
import { TerritoryMap } from '@/components/map/territory-map';
import { PanelSenal } from '@/components/senales/panel-senal';
import { ScoreConfianza } from '@/components/senales/score-confianza';
import { capaDeTipo, CAPAS_POR_DEFECTO, type ClaveCapa } from '@/lib/capas';
import type {
  CamaraAmbiente,
  Diagnostico,
  EvidenciaSenal,
  PuntoEntidad,
  RazonSenal,
  SenalResumen,
} from '@/lib/radar';

/**
 * Pantalla de mando: riel de capas, territorio y cajón de señales.
 *
 * Es el único componente de cliente de la pantalla, y existe porque el riel y el
 * mapa comparten estado: qué capas están encendidas y qué entidad está
 * seleccionada. Los datos llegan ya resueltos desde el servidor.
 */

const CAJONES = [
  { clave: 'senales', etiqueta: 'Señales' },
  { clave: 'entidades', etiqueta: 'Entidades' },
] as const;

type ClaveCajon = (typeof CAJONES)[number]['clave'];

export function CommandView({
  puntos,
  senales,
  razones,
  evidencias,
  camaras,
  diagnosticos,
}: {
  puntos: readonly PuntoEntidad[];
  senales: readonly SenalResumen[];
  razones: Readonly<Record<string, RazonSenal[]>>;
  evidencias: Readonly<Record<string, EvidenciaSenal[]>>;
  camaras: readonly CamaraAmbiente[];
  diagnosticos: readonly Diagnostico[];
}) {
  const [capas, setCapas] = useState<readonly ClaveCapa[]>(CAPAS_POR_DEFECTO);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [cajon, setCajon] = useState<ClaveCajon>('senales');
  const [cajonAbierto, setCajonAbierto] = useState(true);
  const [senalAbierta, setSenalAbierta] = useState<string | null>(null);

  const entidadesConSenal = useMemo(
    () => new Set(senales.map((s) => s.entidadId).filter((id): id is string => id !== null)),
    [senales],
  );

  const conteos = useMemo(() => {
    const base: Record<ClaveCapa, number> = {
      senales: entidadesConSenal.size,
      proyectos: 0,
      yacimientos: 0,
      pozos: 0,
      infraestructura: 0,
      camaras: camaras.length,
    };
    for (const punto of puntos) {
      const capa = capaDeTipo(punto.tipo);
      if (capa !== null && capa !== 'senales') base[capa] += 1;
    }
    return base;
  }, [puntos, entidadesConSenal, camaras]);

  const alternar = (clave: ClaveCapa) => {
    setCapas((actuales) =>
      actuales.includes(clave) ? actuales.filter((c) => c !== clave) : [...actuales, clave],
    );
  };

  const senalSeleccionada = senales.find((s) => s.id === senalAbierta) ?? null;
  const entidad = puntos.find((p) => p.id === seleccionada) ?? null;
  const senalesDeEntidad = entidad ? senales.filter((s) => s.entidadId === entidad.id) : [];

  return (
    <div className="flex h-full min-h-0">
      <LayerRail activas={capas} conteos={conteos} onAlternar={alternar} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* ── Territorio ────────────────────────────────────────────────── */}
        <div className="relative min-h-0 flex-1 bg-mad-surface-inset">
          <TerritoryMap
            puntos={puntos}
            camaras={camaras}
            capasActivas={capas}
            entidadesConSenal={entidadesConSenal}
            seleccionada={seleccionada}
            onSeleccionar={setSeleccionada}
          />

          <PanelDiagnostico diagnosticos={diagnosticos} />

          {senalSeleccionada ? (
            <PanelSenal
              senal={senalSeleccionada}
              razones={razones[senalSeleccionada.id] ?? []}
              evidencias={evidencias[senalSeleccionada.id] ?? []}
              onCerrar={() => setSenalAbierta(null)}
            />
          ) : null}

          {/* Panel de detalle: flota sobre el territorio, no lo desplaza. */}
          {entidad ? (
            <aside className="mad-panel mad-panel-active absolute top-4 left-4 w-72">
              <header className="flex items-start justify-between gap-3 border-b border-mad-line px-4 py-3">
                <div className="min-w-0">
                  <p className="mad-label">{entidad.tipo}</p>
                  <h2 className="mt-1 truncate text-sm font-medium text-mad-fg">
                    {entidad.nombre}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSeleccionada(null)}
                  aria-label="Cerrar detalle"
                  className="text-mad-fg-faint transition-colors hover:text-mad-fg"
                >
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor">
                    <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                  </svg>
                </button>
              </header>

              <dl className="grid grid-cols-2 gap-px bg-mad-line">
                <div className="bg-mad-surface px-4 py-3">
                  <dt className="mad-label">Provincia</dt>
                  <dd className="mt-1 text-xs text-mad-fg">{entidad.provincia ?? '—'}</dd>
                </div>
                <div className="bg-mad-surface px-4 py-3">
                  <dt className="mad-label">Coordenadas</dt>
                  <dd className="mt-1 text-xs tabular-nums text-mad-fg">
                    {entidad.lat.toFixed(3)}, {entidad.lon.toFixed(3)}
                  </dd>
                </div>
              </dl>

              <div className="border-t border-mad-line px-4 py-3">
                <p className="mad-label">Señales abiertas</p>
                {senalesDeEntidad.length === 0 ? (
                  <p className="mt-2 text-xs text-mad-fg-faint">Ninguna.</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-2">
                    {senalesDeEntidad.map((senal) => (
                      <li key={senal.id} className="text-xs text-mad-fg">
                        {senal.titulo}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {entidad.esDemo ? (
                <p className="border-t border-mad-line px-4 py-2.5 text-[11px] text-mad-attention">
                  Dato sembrado para demostración. No es un hecho de fuente.
                </p>
              ) : null}
            </aside>
          ) : null}

          {/* Lectura de estado, abajo a la derecha. */}
          <p className="absolute right-4 bottom-4 text-[11px] tabular-nums text-mad-fg-faint">
            {puntos.length} entidades · {capas.length} capas activas
            {capas.includes('camaras') && camaras.length > 0
              ? ' · cámaras: Gobierno de la Ciudad de Buenos Aires (CC BY 2.5 AR)'
              : ''}
          </p>
        </div>

        {/* ── Cajón inferior ────────────────────────────────────────────── */}
        <section
          className={`flex shrink-0 flex-col border-t border-mad-line bg-mad-surface transition-[height] duration-200 ${
            cajonAbierto ? 'h-64' : 'h-10'
          }`}
        >
          <nav className="flex shrink-0 border-b border-mad-line" aria-label="Listados">
            {CAJONES.map((item) => {
              const activo = cajon === item.clave;
              const cantidad = item.clave === 'senales' ? senales.length : puntos.length;
              return (
                <button
                  key={item.clave}
                  type="button"
                  onClick={() => setCajon(item.clave)}
                  aria-current={activo ? 'true' : undefined}
                  className={`flex items-center gap-2 border-r border-mad-line px-4 py-2.5 text-xs transition-colors ${
                    activo
                      ? 'bg-mad-surface-raised text-mad-fg'
                      : 'text-mad-fg-faint hover:text-mad-fg-dim'
                  }`}
                >
                  {item.etiqueta}
                  <span className="tabular-nums text-mad-fg-faint">{cantidad}</span>
                </button>
              );
            })}

            {/* Plegar el cajón: el territorio se queda con todo el alto. */}
            <button
              type="button"
              onClick={() => setCajonAbierto((abierto) => !abierto)}
              aria-expanded={cajonAbierto}
              title={cajonAbierto ? 'Plegar el panel' : 'Desplegar el panel'}
              className="ml-auto flex w-10 items-center justify-center border-l border-mad-line text-mad-fg-faint transition-colors hover:text-mad-fg"
            >
              <svg
                viewBox="0 0 16 16"
                aria-hidden
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  cajonAbierto ? '' : 'rotate-180'
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M3 6l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </nav>

          <div className={`min-h-0 flex-1 overflow-y-auto ${cajonAbierto ? '' : 'hidden'}`}>
            {cajon === 'senales' ? (
              <ListaSenales
                senales={senales}
                onSeleccionar={setSeleccionada}
                onAbrir={setSenalAbierta}
                seleccionada={seleccionada}
                abierta={senalAbierta}
              />
            ) : (
              <ListaEntidades
                puntos={puntos}
                onSeleccionar={setSeleccionada}
                seleccionada={seleccionada}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ListaSenales({
  senales,
  seleccionada,
  abierta,
  onSeleccionar,
  onAbrir,
}: {
  senales: readonly SenalResumen[];
  seleccionada: string | null;
  abierta: string | null;
  onSeleccionar: (id: string | null) => void;
  onAbrir: (id: string | null) => void;
}) {
  if (senales.length === 0) {
    return (
      <p className="px-4 py-6 text-xs text-mad-fg-dim">
        No hay señales visibles. O todavía no se generó ninguna, o tu usuario no es miembro de
        ningún espacio de trabajo — el aislamiento por fila filtra lo que no te corresponde.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-mad-line">
      {senales.map((senal) => {
        const activa = senal.id === abierta || (senal.entidadId !== null && senal.entidadId === seleccionada);
        return (
          <li key={senal.id}>
            <button
              type="button"
              onClick={() => {
                onSeleccionar(senal.entidadId);
                onAbrir(senal.id);
              }}
              className={`flex w-full items-center justify-between gap-6 px-4 py-3 text-left transition-colors ${
                activa ? 'bg-mad-accent/8' : 'hover:bg-mad-surface-raised'
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-mad-fg">{senal.titulo}</p>
                <p className="mt-0.5 flex items-center gap-2 text-[11px] text-mad-fg-faint">
                  <span
                    className={`mad-dot ${senal.publicada ? 'text-mad-ok' : 'text-mad-fg-faint'}`}
                  />
                  {senal.publicada ? 'Publicada' : 'Esperando curación'}
                  {senal.accionSugerida ? ` · ${senal.accionSugerida.replace(/_/g, ' ')}` : ''}
                </p>
              </div>
              <ScoreConfianza score={senal.score} confidence={senal.confidence} compacto />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function ListaEntidades({
  puntos,
  seleccionada,
  onSeleccionar,
}: {
  puntos: readonly PuntoEntidad[];
  seleccionada: string | null;
  onSeleccionar: (id: string | null) => void;
}) {
  if (puntos.length === 0) {
    return (
      <p className="px-4 py-6 text-xs text-mad-fg-dim">
        Sin entidades geolocalizadas todavía.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-mad-line">
      {puntos.slice(0, 200).map((punto) => {
        const activa = punto.id === seleccionada;
        return (
          <li key={punto.id}>
            <button
              type="button"
              onClick={() => onSeleccionar(activa ? null : punto.id)}
              className={`flex w-full items-center justify-between gap-6 px-4 py-2.5 text-left transition-colors ${
                activa ? 'bg-mad-accent/8' : 'hover:bg-mad-surface-raised'
              }`}
            >
              <span className="truncate text-sm text-mad-fg">{punto.nombre}</span>
              <span className="flex shrink-0 items-center gap-4 text-[11px] text-mad-fg-faint">
                <span>{punto.tipo}</span>
                <span>{punto.provincia ?? '—'}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
