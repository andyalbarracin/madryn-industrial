import 'server-only';

/**
 * Datos vivos de la marquesina.
 *
 * Fuentes públicas, sin clave, consultadas desde el servidor y cacheadas: el
 * navegador del usuario no habla con nadie más que con nosotros.
 *
 *  - Sismos: servicio geológico de Estados Unidos, **dominio público**. Sin
 *    restricción de uso comercial.
 *
 *  - Clima: servicio meteorológico abierto. Los **datos** son CC-BY 4.0, pero el
 *    plan gratuito de la API está limitado a uso **no comercial**: su condición
 *    incluye expresamente "integrar el servicio en productos comerciales".
 *
 *    🔴 MADRYN ES UN PRODUCTO COMERCIAL. Antes de cobrarle a un cliente hay que
 *    contratar el plan pago del proveedor o cambiar de proveedor. Está acotado a
 *    este módulo justamente para que ese cambio sea de una función, no de media
 *    aplicación.
 *
 * Si una fuente no responde, su tramo desaparece de la marquesina y el resto
 * sigue. Una marquesina que se cae entera porque un servicio externo tosió es
 * peor que una a la que le falta un dato.
 */

export interface ItemVivo {
  clave: string;
  etiqueta: string;
  valor: string;
  tono: 'normal' | 'ok' | 'atencion';
}

/** Polos industriales que seguimos. Coinciden con las cuencas del modelo de datos. */
const POLOS = [
  { nombre: 'Neuquén', lat: -38.95, lon: -68.06 },
  { nombre: 'Comodoro', lat: -45.86, lon: -67.48 },
  { nombre: 'San Juan', lat: -31.54, lon: -68.53 },
] as const;

const REVALIDAR_CLIMA = 900; // 15 min
const REVALIDAR_SISMOS = 600; // 10 min

interface RespuestaClima {
  current?: { temperature_2m?: number; wind_speed_10m?: number };
}

async function traerClima(): Promise<ItemVivo[]> {
  const lat = POLOS.map((p) => p.lat).join(',');
  const lon = POLOS.map((p) => p.lon).join(',');
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,wind_speed_10m&wind_speed_unit=kmh`;

  try {
    const respuesta = await fetch(url, { next: { revalidate: REVALIDAR_CLIMA } });
    if (!respuesta.ok) return [];

    const cuerpo: unknown = await respuesta.json();
    // Con varias coordenadas devuelve un arreglo; con una sola, un objeto.
    const filas: RespuestaClima[] = Array.isArray(cuerpo)
      ? (cuerpo as RespuestaClima[])
      : [cuerpo as RespuestaClima];

    return filas.flatMap((fila, i) => {
      const polo = POLOS[i];
      const temp = fila.current?.temperature_2m;
      const viento = fila.current?.wind_speed_10m;
      if (!polo || temp === undefined) return [];

      return [
        {
          clave: `clima-${polo.nombre}`,
          etiqueta: polo.nombre,
          valor:
            `${Math.round(temp)}°C` +
            (viento === undefined ? '' : ` · viento ${Math.round(viento)} km/h`),
          // Viento fuerte para izaje y trabajo en altura: dato operativo, no clima de fondo.
          tono: viento !== undefined && viento >= 40 ? 'atencion' : 'normal',
        },
      ];
    });
  } catch {
    return [];
  }
}

interface RasgoSismo {
  properties?: { mag?: number; place?: string; time?: number };
  geometry?: { coordinates?: number[] };
}

/** Recorte del Cono Sur: lo que pasa lejos no mueve una decisión acá. */
const RECORTE = { latMin: -56, latMax: -20, lonMin: -76, lonMax: -52 };

async function traerSismos(): Promise<ItemVivo[]> {
  const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';

  try {
    const respuesta = await fetch(url, { next: { revalidate: REVALIDAR_SISMOS } });
    if (!respuesta.ok) return [];

    const cuerpo = (await respuesta.json()) as { features?: RasgoSismo[] };
    const rasgos = cuerpo.features ?? [];

    const cercanos = rasgos
      .filter((rasgo) => {
        const coords = rasgo.geometry?.coordinates;
        if (!coords || coords.length < 2) return false;
        const [lon, lat] = coords as [number, number];
        return (
          lat >= RECORTE.latMin &&
          lat <= RECORTE.latMax &&
          lon >= RECORTE.lonMin &&
          lon <= RECORTE.lonMax
        );
      })
      .sort((a, b) => (b.properties?.time ?? 0) - (a.properties?.time ?? 0))
      .slice(0, 2);

    if (cercanos.length === 0) {
      return [
        {
          clave: 'sismos',
          etiqueta: 'Sismos Cono Sur 24 h',
          valor: 'sin eventos ≥ 2.5',
          tono: 'ok',
        },
      ];
    }

    return cercanos.flatMap((rasgo, i) => {
      const mag = rasgo.properties?.mag;
      const lugar = rasgo.properties?.place;
      if (mag === undefined) return [];
      return [
        {
          clave: `sismo-${i}`,
          etiqueta: `Sismo M${mag.toFixed(1)}`,
          valor: lugar ?? 'ubicación no informada',
          tono: mag >= 5 ? 'atencion' : 'normal',
        },
      ];
    });
  } catch {
    return [];
  }
}

export async function getDatosVivos(): Promise<ItemVivo[]> {
  const [clima, sismos] = await Promise.all([traerClima(), traerSismos()]);
  return [...clima, ...sismos];
}
