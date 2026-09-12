'use client';

import { useMemo } from 'react';

import { capaDeTipo, CAPAS, type ClaveCapa } from '@/lib/capas';
import type { PuntoEntidad } from '@/lib/radar';

/**
 * Lienzo territorial.
 *
 * Proyección Mercator esférica sobre SVG, con el encuadre calculado a partir de
 * los propios puntos. Sin biblioteca de mapas y sin mapa base todavía: mientras
 * no exista el mosaico vectorial propio, dibujar calles y etiquetas de un
 * proveedor ajeno sería ruido geográfico y además una dependencia que no
 * queremos. Lo que importa acá son los nodos, no el fondo.
 *
 * **Gancho declarado:** mapa vectorial con mosaico propio. Este componente ya
 * trabaja en coordenadas geográficas, así que el cambio es interno.
 */

const ANCHO = 1000;
const ALTO = 720;
const MARGEN = 48;

/** Mercator esférica: la latitud se deforma, la longitud es lineal. */
function proyectarY(lat: number): number {
  const rad = (lat * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
}

interface Props {
  puntos: readonly PuntoEntidad[];
  capasActivas: readonly ClaveCapa[];
  /** Entidades que tienen al menos una señal abierta. */
  entidadesConSenal: ReadonlySet<string>;
  seleccionada: string | null;
  onSeleccionar: (id: string | null) => void;
}

export function TerritoryMap({
  puntos,
  capasActivas,
  entidadesConSenal,
  seleccionada,
  onSeleccionar,
}: Props) {
  const activas = useMemo(() => new Set(capasActivas), [capasActivas]);

  const dibujables = useMemo(() => {
    if (puntos.length === 0) return [];

    const lons = puntos.map((p) => p.lon);
    const ys = puntos.map((p) => proyectarY(p.lat));
    const lonMin = Math.min(...lons);
    const lonMax = Math.max(...lons);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);

    // Un solo punto, o todos alineados: se evita dividir por cero.
    const anchoGeo = lonMax - lonMin || 1;
    const altoGeo = yMax - yMin || 1;

    // Escala única para los dos ejes: mantiene la proporción del territorio.
    const escala = Math.min((ANCHO - MARGEN * 2) / anchoGeo, (ALTO - MARGEN * 2) / altoGeo);
    const desplazX = (ANCHO - anchoGeo * escala) / 2;
    const desplazY = (ALTO - altoGeo * escala) / 2;

    return puntos.map((punto) => ({
      punto,
      x: desplazX + (punto.lon - lonMin) * escala,
      // El eje Y del SVG crece hacia abajo; la latitud, hacia arriba.
      y: desplazY + (yMax - proyectarY(punto.lat)) * escala,
    }));
  }, [puntos]);

  const visibles = dibujables.filter(({ punto }) => {
    const conSenal = entidadesConSenal.has(punto.id);
    if (conSenal && activas.has('senales')) return true;
    const capa = capaDeTipo(punto.tipo);
    return capa !== null && activas.has(capa);
  });

  if (puntos.length === 0) {
    return (
      <div className="mad-grid flex h-full items-center justify-center">
        <div className="max-w-md px-6 text-center">
          <p className="mad-label">Territorio</p>
          <p className="mt-3 text-sm text-mad-fg-dim">
            No hay entidades geolocalizadas todavía. Aparecen acá apenas la primera ingesta escriba
            entidades con coordenadas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      role="img"
      aria-label={`Mapa territorial con ${visibles.length} entidades visibles`}
      onClick={() => onSeleccionar(null)}
    >
      <defs>
        <pattern id="mapa-malla" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="#1E2733" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width={ANCHO} height={ALTO} fill="url(#mapa-malla)" />

      {/* Cruz de encuadre en las cuatro esquinas del área útil. */}
      <g stroke="#2A3441" strokeWidth="1" fill="none">
        <path d={`M${MARGEN} ${MARGEN / 2}V${MARGEN}H${MARGEN * 1.6}`} />
        <path d={`M${ANCHO - MARGEN * 1.6} ${MARGEN}H${ANCHO - MARGEN}V${MARGEN / 2}`} />
        <path d={`M${MARGEN} ${ALTO - MARGEN / 2}V${ALTO - MARGEN}H${MARGEN * 1.6}`} />
        <path
          d={`M${ANCHO - MARGEN * 1.6} ${ALTO - MARGEN}H${ANCHO - MARGEN}V${ALTO - MARGEN / 2}`}
        />
      </g>

      {/* Los puntos van del más chico al más grande para que nada quede tapado. */}
      <g>
        {visibles
          .slice()
          .sort((a, b) => {
            const ra = entidadesConSenal.has(a.punto.id) ? 9 : 0;
            const rb = entidadesConSenal.has(b.punto.id) ? 9 : 0;
            return ra - rb;
          })
          .map(({ punto, x, y }) => {
            const conSenal = entidadesConSenal.has(punto.id);
            const capa = CAPAS.find((c) => c.clave === (conSenal ? 'senales' : capaDeTipo(punto.tipo)));
            const radio = capa?.radio ?? 2;
            const color = capa?.color ?? 'var(--mad-steel)';
            const elegida = seleccionada === punto.id;

            return (
              <g
                key={punto.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeleccionar(elegida ? null : punto.id);
                }}
                className="cursor-pointer"
              >
                {/* Halo: sólo para lo que tiene señal o está seleccionado. */}
                {conSenal || elegida ? (
                  <circle cx={x} cy={y} r={radio * 3.4} fill={color} fillOpacity={0.12} />
                ) : null}

                <circle cx={x} cy={y} r={radio} fill={color} fillOpacity={conSenal ? 1 : 0.75} />

                {elegida ? (
                  <>
                    <circle
                      cx={x}
                      cy={y}
                      r={radio + 6}
                      fill="none"
                      stroke="var(--mad-highlight)"
                      strokeWidth="1"
                    />
                    <text
                      x={x + radio + 12}
                      y={y + 4}
                      fill="var(--mad-fg)"
                      fontSize="12"
                      className="pointer-events-none"
                    >
                      {punto.nombre}
                    </text>
                  </>
                ) : null}

                <title>
                  {punto.nombre} · {punto.tipo}
                  {punto.provincia ? ` · ${punto.provincia}` : ''}
                </title>
              </g>
            );
          })}
      </g>
    </svg>
  );
}
