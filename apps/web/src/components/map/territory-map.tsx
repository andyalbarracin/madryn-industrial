'use client';

import 'maplibre-gl/dist/maplibre-gl.css';

import { useMemo, useState } from 'react';
import Map, { Layer, NavigationControl, ScaleControl, Source, type MapLayerMouseEvent } from 'react-map-gl/maplibre';

import { capaDeTipo, type ClaveCapa } from '@/lib/capas';
import { publicEnv } from '@/lib/env';
import type { PuntoEntidad } from '@/lib/radar';

/**
 * Territorio real: mapa vectorial con calles, costas y topónimos.
 *
 * El estilo del mapa base sale de `NEXT_PUBLIC_BASEMAP_STYLE_URL`. Hoy apunta a
 * un servicio de mosaicos vectoriales libre derivado de datos abiertos, sin
 * clave. El destino sigue siendo el mosaico propio: cuando exista, se cambia la
 * variable y este componente no se entera.
 *
 * Los nodos se dibujan con capas nativas del motor —no marcadores de HTML— para
 * que miles de puntos no maten el desplazamiento.
 */

const ESTILO_POR_DEFECTO = 'https://tiles.openfreemap.org/styles/dark';

/** Encuadre inicial: Argentina entera. */
const VISTA_INICIAL = { longitude: -64.5, latitude: -38.5, zoom: 3.6 } as const;

const COLOR_POR_CAPA: Record<ClaveCapa, string> = {
  senales: '#A7C7F7',
  proyectos: '#4F7CD9',
  yacimientos: '#4F7CD9',
  pozos: '#566377',
  infraestructura: '#566377',
};

const RADIO_POR_CAPA: Record<ClaveCapa, number> = {
  senales: 6,
  proyectos: 5,
  yacimientos: 4.5,
  pozos: 3,
  infraestructura: 3.5,
};

interface Props {
  puntos: readonly PuntoEntidad[];
  capasActivas: readonly ClaveCapa[];
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
  const [cursor, setCursor] = useState<'grab' | 'pointer'>('grab');
  const activas = useMemo(() => new Set(capasActivas), [capasActivas]);

  /** Un punto pertenece a la capa de señales si tiene una; si no, a la de su tipo. */
  const coleccion = useMemo(() => {
    const features = puntos
      .map((punto) => {
        const conSenal = entidadesConSenal.has(punto.id);
        const capa: ClaveCapa | null = conSenal ? 'senales' : capaDeTipo(punto.tipo);
        return { punto, capa, conSenal };
      })
      .filter((f): f is { punto: PuntoEntidad; capa: ClaveCapa; conSenal: boolean } => f.capa !== null)
      .filter((f) => activas.has(f.capa))
      .map(({ punto, capa, conSenal }) => ({
        type: 'Feature' as const,
        id: punto.id,
        geometry: { type: 'Point' as const, coordinates: [punto.lon, punto.lat] },
        properties: {
          id: punto.id,
          nombre: punto.nombre,
          tipo: punto.tipo,
          capa,
          color: COLOR_POR_CAPA[capa],
          radio: RADIO_POR_CAPA[capa],
          conSenal: conSenal ? 1 : 0,
          elegida: punto.id === seleccionada ? 1 : 0,
        },
      }));

    return { type: 'FeatureCollection' as const, features };
  }, [puntos, activas, entidadesConSenal, seleccionada]);

  const alHacerClick = (evento: MapLayerMouseEvent) => {
    const rasgo = evento.features?.[0];
    const id = rasgo?.properties?.['id'];
    onSeleccionar(typeof id === 'string' && id !== seleccionada ? id : null);
  };

  return (
    <Map
      initialViewState={VISTA_INICIAL}
      mapStyle={publicEnv.basemapStyleUrl || ESTILO_POR_DEFECTO}
      style={{ width: '100%', height: '100%' }}
      interactiveLayerIds={['nodos']}
      onClick={alHacerClick}
      onMouseEnter={() => setCursor('pointer')}
      onMouseLeave={() => setCursor('grab')}
      cursor={cursor}
      attributionControl={{ compact: true }}
    >
      <NavigationControl position="bottom-right" showCompass={false} />
      <ScaleControl position="bottom-left" unit="metric" />

      <Source id="entidades" type="geojson" data={coleccion}>
        {/* Halo: sólo para lo que tiene señal o está seleccionado. Es el único
            brillo de la interfaz. */}
        <Layer
          id="halos"
          type="circle"
          filter={['any', ['==', ['get', 'conSenal'], 1], ['==', ['get', 'elegida'], 1]]}
          paint={{
            'circle-radius': ['*', ['get', 'radio'], 3],
            'circle-color': ['get', 'color'],
            'circle-opacity': 0.16,
          }}
        />

        <Layer
          id="nodos"
          type="circle"
          paint={{
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              3,
              ['*', ['get', 'radio'], 0.6],
              10,
              ['get', 'radio'],
            ],
            'circle-color': ['get', 'color'],
            'circle-opacity': ['case', ['==', ['get', 'conSenal'], 1], 1, 0.8],
            'circle-stroke-width': ['case', ['==', ['get', 'elegida'], 1], 1.5, 0],
            'circle-stroke-color': '#EAEFF4',
          }}
        />

        {/* El nombre aparece sólo con acercamiento: a escala país sería ilegible. */}
        <Layer
          id="etiquetas"
          type="symbol"
          minzoom={6}
          layout={{
            'text-field': ['get', 'nombre'],
            'text-size': 11,
            'text-offset': [0, 1.2],
            'text-anchor': 'top',
            'text-allow-overlap': false,
          }}
          paint={{
            'text-color': '#EAEFF4',
            'text-halo-color': '#0B0F14',
            'text-halo-width': 1.2,
          }}
        />
      </Source>
    </Map>
  );
}
