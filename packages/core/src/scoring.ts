/**
 * Puntaje de oportunidad y confianza.
 *
 * Las dos reglas que gobiernan este archivo:
 *
 * 1. **Puntaje y confianza son cosas distintas y se calculan por separado.**
 *    El puntaje dice qué tan atractiva parece la oportunidad; la confianza, qué
 *    tan sólida es la evidencia detrás. Un 61 con confianza 0,41 es "prometedor
 *    pero sin confirmar", y es una lectura distinta de un 61 con 0,9. Por eso
 *    ninguna de las dos entra en el cálculo de la otra.
 *
 * 2. **Todo puntaje viene con su desglose.** Un número sin explicación es una
 *    opinión con pretensiones. Los aportes suman exactamente el total, incluidas
 *    las penalizaciones, que se muestran igual que lo que suma.
 *
 * Funciones puras: sin entrada/salida, sin reloj, sin azar. El tiempo entra como
 * un número de días que calcula quien llama.
 */

import type { ClaimKind, Confidence, Score } from './domain';
import { encajeGeografico } from './geo';

/** Cuánto puede aportar cada factor al puntaje final. Suman 100. */
const PESOS = {
  geografia: 35,
  servicios: 35,
  frescura: 30,
} as const;

/** Cuánto descuenta cada dato que falta para poder accionar. */
const CASTIGO_POR_FALTANTE = 6;

/** Días en los que un hecho pierde la mitad de su frescura. */
const VIDA_MEDIA_DIAS = 21;

export interface EvidenciaResumen {
  claimKind: ClaimKind;
}

export interface EntradaPuntaje {
  /** Distancia a la base operativa más cercana. `null` si no se conoce. */
  distanciaKm: number | null;
  /** Radio comercial declarado del espacio de trabajo. */
  radioKm: number;
  /** Qué servicios hacen falta para esta oportunidad. */
  serviciosRequeridos: readonly string[];
  /** Qué servicios presta el cliente. */
  serviciosOfrecidos: readonly string[];
  /** Días transcurridos desde que ocurrió el hecho. `null` si no se conoce. */
  diasDesdeElHecho: number | null;
  /** Afirmaciones que sostienen la señal. */
  evidencias: readonly EvidenciaResumen[];
  /** Qué falta para que la señal sea accionable sin fricción. */
  faltantes: readonly string[];
}

export interface ComponentePuntaje {
  /** Identificador estable del factor, para agrupar y comparar. */
  factor: string;
  /** Cómo se le muestra a una persona. */
  etiqueta: string;
  /** Puntos que aporta. Negativo si castiga. */
  aporte: number;
}

export interface ResultadoPuntaje {
  score: Score;
  confidence: Confidence;
  componentes: ComponentePuntaje[];
}

function normalizar(valor: string): string {
  return valor.trim().toLowerCase();
}

/**
 * Qué proporción de lo requerido puede cubrir el cliente, de 0 a 1.
 *
 * Sin requerimientos declarados devuelve 0, no 1: que no sepamos qué hace falta
 * no significa que encajemos. Suponer lo contrario infla el puntaje justo en los
 * casos peor documentados.
 */
export function encajeDeServicios(
  requeridos: readonly string[],
  ofrecidos: readonly string[],
): number {
  if (requeridos.length === 0) return 0;

  const disponibles = new Set(ofrecidos.map(normalizar));
  const cubiertos = requeridos.filter((servicio) => disponibles.has(normalizar(servicio)));

  return cubiertos.length / requeridos.length;
}

/**
 * Cuánto vale un hecho según su antigüedad, de 0 a 1.
 *
 * Decaimiento con vida media: a los 21 días vale la mitad. Una oportunidad
 * industrial no se evapora, pero llegar primero importa.
 *
 * Sin fecha conocida devuelve 0: no se premia lo que no se puede fechar.
 */
export function frescura(diasDesdeElHecho: number | null): number {
  if (diasDesdeElHecho === null || !Number.isFinite(diasDesdeElHecho)) return 0;

  // Una fecha futura es un error de datos, no una señal más fresca que hoy.
  const dias = Math.max(0, diasDesdeElHecho);
  return 0.5 ** (dias / VIDA_MEDIA_DIAS);
}

/**
 * Cuánto sostiene cada tipo de afirmación.
 *
 * El orden no es arbitrario: un hecho publicado por la fuente y un resultado
 * confirmado por el cliente son las dos únicas cosas que se pueden verificar.
 * Todo lo demás es interpretación nuestra, y se declara como tal.
 */
const PESO_POR_AFIRMACION: Record<ClaimKind, number> = {
  resultado_confirmado: 1,
  hecho_de_fuente: 0.95,
  inferencia: 0.55,
  opinion_humana: 0.45,
  prediccion: 0.35,
  recomendacion: 0.3,
};

/** Confianza cuando no hay ninguna evidencia cargada. Baja, pero no nula. */
const CONFIANZA_SIN_EVIDENCIA = 0.15;

export function calcularConfianza({
  evidencias,
  faltantes,
  distanciaConocida,
}: {
  evidencias: readonly EvidenciaResumen[];
  faltantes: readonly string[];
  distanciaConocida: boolean;
}): Confidence {
  const base =
    evidencias.length === 0
      ? CONFIANZA_SIN_EVIDENCIA
      : evidencias.reduce((total, e) => total + PESO_POR_AFIRMACION[e.claimKind], 0) /
        evidencias.length;

  // Lo que falta no cambia si la oportunidad es buena; cambia cuánto podemos
  // afirmarlo. Por eso descuenta acá y no en el puntaje.
  const castigo = faltantes.length * 0.05 + (distanciaConocida ? 0 : 0.1);

  const valor = Math.max(0, Math.min(1, base - castigo));
  return Number(valor.toFixed(2));
}

export function calcularPuntaje(entrada: EntradaPuntaje): ResultadoPuntaje {
  const geo = encajeGeografico({ distanciaKm: entrada.distanciaKm, radioKm: entrada.radioKm });
  const servicios = encajeDeServicios(entrada.serviciosRequeridos, entrada.serviciosOfrecidos);
  const reciente = frescura(entrada.diasDesdeElHecho);

  const componentes: ComponentePuntaje[] = [
    {
      factor: 'encaje_geografico',
      etiqueta:
        entrada.distanciaKm === null
          ? 'Sin ubicación conocida'
          : `A ${Math.round(entrada.distanciaKm)} km de la base más cercana`,
      aporte: geo * PESOS.geografia,
    },
    {
      factor: 'encaje_de_servicios',
      etiqueta:
        entrada.serviciosRequeridos.length === 0
          ? 'No se sabe qué servicios requiere'
          : `Cubrís ${Math.round(servicios * 100)} % de lo que requiere`,
      aporte: servicios * PESOS.servicios,
    },
    {
      factor: 'frescura',
      etiqueta:
        entrada.diasDesdeElHecho === null
          ? 'Sin fecha del hecho'
          : `Ocurrió hace ${Math.max(0, Math.round(entrada.diasDesdeElHecho))} días`,
      aporte: reciente * PESOS.frescura,
    },
  ];

  if (entrada.faltantes.length > 0) {
    componentes.push({
      factor: 'datos_faltantes',
      etiqueta: `Faltan ${entrada.faltantes.length} datos para accionar: ${entrada.faltantes.join(', ')}`,
      aporte: -(entrada.faltantes.length * CASTIGO_POR_FALTANTE),
    });
  }

  const bruto = componentes.reduce((total, c) => total + c.aporte, 0);
  const score = Math.max(0, Math.min(100, Math.round(bruto)));

  // Los aportes tienen que sumar el puntaje mostrado. Si el recorte a [0, 100]
  // movió el total, se anota el ajuste en vez de dejar un desglose que no cierra:
  // un desglose que no suma es peor que no tener desglose.
  const suma = componentes.reduce((total, c) => total + c.aporte, 0);
  if (Math.round(suma) !== score) {
    componentes.push({
      factor: 'ajuste_de_rango',
      etiqueta: 'Ajuste por el límite de la escala 0–100',
      aporte: score - suma,
    });
  }

  return {
    score,
    confidence: calcularConfianza({
      evidencias: entrada.evidencias,
      faltantes: entrada.faltantes,
      distanciaConocida: entrada.distanciaKm !== null,
    }),
    componentes,
  };
}
