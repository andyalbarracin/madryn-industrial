/**
 * Cálculo geográfico puro.
 *
 * La distancia se implementa desde la descripción matemática de la fórmula del
 * semiverseno, que es trigonometría esférica de dominio público. El cálculo
 * geoespacial pesado —vecinos, radios, índices— sigue ocurriendo en la base con
 * PostGIS; acá sólo está lo que hace falta para puntuar on-read sin ida y
 * vuelta a la base.
 */

/** Radio medio de la Tierra en kilómetros. */
const RADIO_TERRESTRE_KM = 6371.0088;

export interface Coordenada {
  lat: number;
  lon: number;
}

function aRadianes(grados: number): number {
  return (grados * Math.PI) / 180;
}

/**
 * Distancia sobre la superficie entre dos coordenadas, en kilómetros.
 *
 * Fórmula del semiverseno: trata a la Tierra como una esfera. El error frente a
 * un elipsoide es del orden del 0,3 %, irrelevante para decidir si un proyecto
 * cae dentro del radio comercial de una base.
 */
export function distanciaKm(a: Coordenada, b: Coordenada): number {
  const dLat = aRadianes(b.lat - a.lat);
  const dLon = aRadianes(b.lon - a.lon);
  const latA = aRadianes(a.lat);
  const latB = aRadianes(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(latA) * Math.cos(latB) * Math.sin(dLon / 2) ** 2;

  return 2 * RADIO_TERRESTRE_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Encaje geográfico: qué tan bien cae algo dentro del alcance comercial, de 0 a 1.
 *
 * Decae de forma continua y no se corta en el borde del radio. Un proyecto a
 * 1,2 radios no es inalcanzable: es más caro de atender, y esa diferencia es de
 * grado. Un corte duro haría que dos proyectos separados por un kilómetro
 * recibieran puntajes opuestos, que es justo lo que no queremos explicarle a un
 * comercial.
 *
 * Sin distancia conocida devuelve 0: no saber dónde está algo no es lo mismo
 * que saber que está cerca.
 */
export function encajeGeografico({
  distanciaKm: distancia,
  radioKm,
}: {
  distanciaKm: number | null;
  radioKm: number;
}): number {
  if (distancia === null || !Number.isFinite(distancia)) return 0;
  if (!Number.isFinite(radioKm) || radioKm <= 0) return 0;

  // Decaimiento exponencial calibrado para que en el borde del radio quede
  // alrededor de 0,14: todavía cuenta, pero ya pesa poco.
  const proporcion = Math.max(0, distancia) / radioKm;
  return Math.exp(-2 * proporcion);
}
