'use client';

// Importación con nombre y sin export por defecto: la versión 6 del motor lo
// eliminó. Un envoltorio que todavía esperaba el export por defecto recibía
// `undefined`, no montaba el lienzo y dejaba la pantalla negra — con la
// atribución visible, que es lo que despistaba.
import {
  GeoJSONSource,
  Map as MotorMapa,
  NavigationControl,
  ScaleControl,
} from 'maplibre-gl';
import { useEffect, useMemo, useRef, useState } from 'react';

import { capaDeTipo, type ClaveCapa } from '@/lib/capas';
import { publicEnv } from '@/lib/env';
import type { PuntoEntidad } from '@/lib/radar';

/**
 * Territorio real: mapa vectorial con calles, costas y topónimos.
 *
 * Se maneja el motor directo, sin envoltorio de React. Un envoltorio más es una
 * pieza más que puede desincronizarse con la versión del motor, y acá el ciclo
 * de vida importa: crear el mapa una vez, actualizar la fuente de datos cuando
 * cambian los puntos, y destruirlo al desmontar.
 *
 * El lienzo se posiciona con `inset-0` sobre un contenedor relativo, no con
 * alto porcentual: un alto en porcentaje depende de que cada ancestro tenga
 * altura definida, y basta un eslabón suelto para que el lienzo quede en cero y
 * la pantalla se vea negra sin decir por qué.
 *
 * Los fallos del motor se muestran. Un mapa que no carga tiene que explicarse.
 */

const ESTILO_POR_DEFECTO = 'https://tiles.openfreemap.org/styles/dark';

/** Encuadre inicial: Argentina continental entera. */
const CENTRO: [number, number] = [-64.5, -38.5];
const ZOOM = 3.4;

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
  const contenedor = useRef<HTMLDivElement | null>(null);
  const mapa = useRef<InstanceType<typeof MotorMapa> | null>(null);
  const [listo, setListo] = useState(false);
  const [fallo, setFallo] = useState<string | null>(null);

  // El manejador de clic vive en una referencia: el mapa se suscribe una sola
  // vez, pero tiene que llamar siempre a la versión actual. La referencia se
  // actualiza en un efecto y no durante el render, que es cuando todavía no
  // está garantizado que el render vaya a confirmarse.
  const alSeleccionar = useRef(onSeleccionar);
  useEffect(() => {
    alSeleccionar.current = onSeleccionar;
  }, [onSeleccionar]);

  const activas = useMemo(() => new Set(capasActivas), [capasActivas]);

  const coleccion = useMemo(() => {
    const features = puntos
      .map((punto) => {
        const conSenal = entidadesConSenal.has(punto.id);
        const capa: ClaveCapa | null = conSenal ? 'senales' : capaDeTipo(punto.tipo);
        return { punto, capa, conSenal };
      })
      .filter(
        (f): f is { punto: PuntoEntidad; capa: ClaveCapa; conSenal: boolean } => f.capa !== null,
      )
      .filter((f) => activas.has(f.capa))
      .map(({ punto, capa, conSenal }) => ({
        type: 'Feature' as const,
        id: punto.id,
        geometry: { type: 'Point' as const, coordinates: [punto.lon, punto.lat] },
        properties: {
          id: punto.id,
          nombre: punto.nombre,
          capa,
          color: COLOR_POR_CAPA[capa],
          radio: RADIO_POR_CAPA[capa],
          conSenal: conSenal ? 1 : 0,
          elegida: punto.id === seleccionada ? 1 : 0,
        },
      }));

    return { type: 'FeatureCollection' as const, features };
  }, [puntos, activas, entidadesConSenal, seleccionada]);

  // ── Creación del mapa: una sola vez ──────────────────────────────────────
  useEffect(() => {
    if (contenedor.current === null || mapa.current !== null) return;

    // El fallo se publica en el siguiente turno del bucle de eventos. Cambiar el
    // estado en el cuerpo del efecto encadena renders y React lo señala.
    const reportarFallo = (mensaje: string) => queueMicrotask(() => setFallo(mensaje));

    let motor: InstanceType<typeof MotorMapa>;
    try {
      motor = new MotorMapa({
        container: contenedor.current,
        style: publicEnv.basemapStyleUrl || ESTILO_POR_DEFECTO,
        center: CENTRO,
        zoom: ZOOM,
        attributionControl: { compact: true },
      });
    } catch (error) {
      reportarFallo(
        error instanceof Error ? error.message : 'No se pudo iniciar el motor de mapas.',
      );
      return;
    }

    mapa.current = motor;
    motor.addControl(new NavigationControl({ showCompass: false }), 'bottom-right');
    motor.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-left');

    // Qué error tapa la pantalla y cuál no.
    //
    // El discriminante es **si el mapa ya cargó**, no el texto del mensaje.
    // Antes de cargar, cualquier error es potencialmente fatal y hay que
    // mostrarlo: es la diferencia entre entender qué pasa y mirar un rectángulo
    // negro. Después de cargar, el mapa funciona y un mosaico suelto que falló
    // no justifica taparlo.
    let cargado = false;

    motor.on('error', (evento) => {
      if (cargado) return;
      reportarFallo(evento.error?.message ?? 'Error del motor de mapas.');
    });

    // Plazo máximo. Si el estilo no terminó de cargar en este tiempo, algo se
    // colgó —el trabajador en segundo plano, la red, el proveedor— y hay que
    // decirlo. Un indicador de carga sin límite no es un estado: es una
    // pantalla rota que no se anima a admitirlo.
    const plazo = window.setTimeout(() => {
      setFallo((anterior) =>
        anterior ??
        'El mapa base está tardando más de lo normal. Puede ser la red, el proveedor de mosaicos, ' +
          'o una máquina sin aceleración por hardware.',
      );
    }, 20_000);

    // Cuándo se consideran listas las capas.
    //
    // No se usa sólo el evento de carga completa: ése espera al primer cuadro
    // dibujado, y en una máquina sin aceleración por hardware puede demorar
    // muchísimo o no llegar. Lo que hace falta para agregar capas es que el
    // estilo esté resuelto, y eso se sabe antes. Se escuchan las dos señales y
    // la bandera evita agregar las capas dos veces.
    let capasAgregadas = false;

    const montarCapas = () => {
      if (capasAgregadas || !motor.isStyleLoaded()) return;
      capasAgregadas = true;

      motor.addSource('entidades', { type: 'geojson', data: coleccion });

      // Halo: sólo para lo que tiene señal o está seleccionado.
      motor.addLayer({
        id: 'halos',
        type: 'circle',
        source: 'entidades',
        filter: ['any', ['==', ['get', 'conSenal'], 1], ['==', ['get', 'elegida'], 1]],
        paint: {
          'circle-radius': ['*', ['get', 'radio'], 3],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.16,
        },
      });

      motor.addLayer({
        id: 'nodos',
        type: 'circle',
        source: 'entidades',
        paint: {
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
        },
      });

      // El nombre aparece recién al acercarse: a escala país sería ilegible.
      motor.addLayer({
        id: 'etiquetas',
        type: 'symbol',
        source: 'entidades',
        minzoom: 6,
        layout: {
          'text-field': ['get', 'nombre'],
          'text-size': 11,
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#EAEFF4',
          'text-halo-color': '#0B0F14',
          'text-halo-width': 1.2,
        },
      });

      motor.on('click', 'nodos', (evento) => {
        const id = evento.features?.[0]?.properties?.['id'];
        if (typeof id === 'string') alSeleccionar.current(id);
      });
      motor.on('mouseenter', 'nodos', () => {
        motor.getCanvas().style.cursor = 'pointer';
      });
      motor.on('mouseleave', 'nodos', () => {
        motor.getCanvas().style.cursor = '';
      });

      cargado = true;
      window.clearTimeout(plazo);
      // Si el aviso de demora alcanzó a aparecer, se retira: el mapa está acá y
      // dejar una advertencia vieja en pantalla es peor que no haberla puesto.
      setFallo(null);
      setListo(true);
    };

    motor.on('load', montarCapas);
    motor.on('styledata', montarCapas);

    return () => {
      window.clearTimeout(plazo);
      motor.remove();
      mapa.current = null;
      setListo(false);
    };
    // Se crea una sola vez a propósito: los datos entran por la fuente, abajo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Datos: la fuente se actualiza, el mapa no se recrea ──────────────────
  useEffect(() => {
    if (!listo || mapa.current === null) return;
    const fuente = mapa.current.getSource('entidades') as GeoJSONSource | undefined;
    fuente?.setData(coleccion);
  }, [coleccion, listo]);

  return (
    <div className="absolute inset-0">
      <div ref={contenedor} className="absolute inset-0" />

      {fallo !== null ? (
        <div className="mad-panel absolute top-4 left-1/2 z-10 w-[min(30rem,calc(100%-2rem))] -translate-x-1/2 border-mad-alert/40 px-4 py-3">
          <p className="text-sm font-medium text-mad-alert">El mapa base no cargó</p>
          <p className="mt-1.5 text-xs leading-relaxed text-mad-fg-dim">{fallo}</p>
          <p className="mt-2 text-xs text-mad-fg-faint">
            Los nodos necesitan el mapa base para ubicarse. Revisá la conexión o definí otro estilo
            en NEXT_PUBLIC_BASEMAP_STYLE_URL.
          </p>
        </div>
      ) : null}

      {!listo && fallo === null ? (
        <p className="mad-label absolute top-4 left-4 z-10">Cargando territorio…</p>
      ) : null}
    </div>
  );
}
