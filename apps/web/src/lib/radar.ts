import 'server-only';

/**
 * Lecturas de la pantalla de mando.
 *
 * Todo pasa por el cliente con la sesión del usuario, así que el aislamiento por
 * fila decide qué sale.
 *
 * **Acá no se traga ningún error.** Una consulta que falla vuelve como
 * diagnóstico con el motivo y qué hacer. Devolver una lista vacía y una frase
 * genérica manda a buscar el problema al lugar equivocado: parece que faltan
 * datos cuando en realidad falta aplicar un archivo de esquema.
 */

import { cache } from 'react';

import { getActiveWorkspace } from './dal';
import { createSupabaseServerClient } from './supabase/server';

export interface PuntoEntidad {
  id: string;
  tipo: string;
  nombre: string;
  provincia: string | null;
  lon: number;
  lat: number;
  esDemo: boolean;
}

export interface SenalResumen {
  id: string;
  titulo: string;
  resumen: string | null;
  /** 0–100. Qué tan atractiva parece la oportunidad. */
  score: number | null;
  /** 0–1. Qué tan sólida es la evidencia. Campo SEPARADO del score. */
  confidence: number | null;
  accionSugerida: string | null;
  entidadId: string | null;
  ocurridoEn: string | null;
  publicada: boolean;
}

/** Un factor del desglose del puntaje. `aporte` negativo = penalización. */
export interface RazonSenal {
  factor: string;
  etiqueta: string;
  aporte: number;
}

/** Una afirmación que sostiene la señal, con su naturaleza declarada. */
export interface EvidenciaSenal {
  id: string;
  claimKind: string;
  fragmento: string | null;
  limitaciones: string | null;
  registroRef: string | null;
}

export interface Diagnostico {
  nivel: 'error' | 'aviso';
  titulo: string;
  detalle: string;
  /** Qué tiene que hacer una persona para resolverlo. */
  accion: string;
}

export interface EstadoRadar {
  puntos: PuntoEntidad[];
  senales: SenalResumen[];
  /** Desglose del puntaje por señal. Clave: id de la señal. */
  razones: Record<string, RazonSenal[]>;
  /** Evidencia por señal. Clave: id de la señal. */
  evidencias: Record<string, EvidenciaSenal[]>;
  diagnosticos: Diagnostico[];
}

/** `42P01` y `PGRST205` son las dos formas de decir "esa tabla o vista no existe". */
function esObjetoInexistente(code: string | undefined): boolean {
  return code === '42P01' || code === 'PGRST205';
}

export const getEstadoRadar = cache(async (): Promise<EstadoRadar> => {
  const supabase = await createSupabaseServerClient();
  const diagnosticos: Diagnostico[] = [];

  const [workspace, geo, signals, reasons, evidence] = await Promise.all([
    getActiveWorkspace(),
    supabase
      .from('mad_entities_geo')
      .select('id, entity_type, nombre_canonico, provincia, lon, lat, es_demo')
      .limit(2000),
    supabase
      .from('mad_signals')
      .select(
        'id, titulo, summary, score, confidence, accion_sugerida, entity_id, occurred_at, publicada_at',
      )
      .order('occurred_at', { ascending: false, nullsFirst: false })
      .limit(100),
    supabase
      .from('mad_signal_reasons')
      .select('signal_id, factor, etiqueta, aporte, orden')
      .order('orden', { ascending: true }),
    supabase
      .from('mad_signal_evidence')
      .select(
        'signal_id, orden, mad_evidence_links!inner(id, claim_kind, fragmento, limitaciones, registro_ref)',
      )
      .order('orden', { ascending: true }),
  ]);

  // ── Membresía ───────────────────────────────────────────────────────────
  if (workspace === null) {
    diagnosticos.push({
      nivel: 'error',
      titulo: 'Tu usuario no pertenece a ningún espacio de trabajo',
      detalle:
        'Las señales, acciones y watchlists se filtran por membresía. Sin una fila en ' +
        'mad_workspace_members no ves nada, y eso es el aislamiento funcionando, no una falla.',
      accion: 'Correr 008_usuarios_demo.sql en el editor SQL.',
    });
  }

  // ── Entidades geolocalizadas ────────────────────────────────────────────
  let puntos: PuntoEntidad[] = [];
  if (geo.error) {
    diagnosticos.push(
      esObjetoInexistente(geo.error.code)
        ? {
            nivel: 'error',
            titulo: 'Falta la vista mad_entities_geo',
            detalle:
              'El mapa lee las coordenadas de esa vista, que entrega lon y lat como números. ' +
              'Todavía no existe en esta base.',
            accion: 'Correr 009_vista_entidades_geo.sql en el editor SQL.',
          }
        : {
            nivel: 'error',
            titulo: 'No se pudieron leer las entidades',
            detalle: `${geo.error.code ?? 'sin código'}: ${geo.error.message}`,
            accion: 'Revisar privilegios y políticas sobre mad_entities_geo.',
          },
    );
  } else if (geo.data) {
    puntos = geo.data.map((fila) => ({
      id: fila.id,
      tipo: fila.entity_type,
      nombre: fila.nombre_canonico,
      provincia: fila.provincia,
      lon: Number(fila.lon),
      lat: Number(fila.lat),
      esDemo: Boolean(fila.es_demo),
    }));

    if (puntos.length === 0) {
      diagnosticos.push({
        nivel: 'aviso',
        titulo: 'La vista existe pero no devolvió puntos',
        detalle:
          'O ninguna entidad tiene geometría cargada, o el aislamiento por fila las está ' +
          'filtrando para este usuario.',
        accion: 'Verificar que 005_seed.sql haya corrido y que tengas membresía.',
      });
    }
  }

  // ── Señales ─────────────────────────────────────────────────────────────
  let senales: SenalResumen[] = [];
  if (signals.error) {
    diagnosticos.push({
      nivel: 'error',
      titulo: 'No se pudieron leer las señales',
      detalle: `${signals.error.code ?? 'sin código'}: ${signals.error.message}`,
      accion: esObjetoInexistente(signals.error.code)
        ? 'Correr 004_mad_signals.sql en el editor SQL.'
        : 'Revisar las políticas de mad_signals.',
    });
  } else if (signals.data) {
    senales = signals.data.map((fila) => ({
      id: fila.id,
      titulo: fila.titulo,
      resumen: fila.summary,
      score: fila.score === null ? null : Number(fila.score),
      confidence: fila.confidence === null ? null : Number(fila.confidence),
      accionSugerida: fila.accion_sugerida,
      entidadId: fila.entity_id,
      ocurridoEn: fila.occurred_at,
      publicada: fila.publicada_at !== null,
    }));
  }

  // ── Desglose y evidencia ────────────────────────────────────────────────
  // Se traen de una sola vez y se agrupan por señal, en vez de una consulta por
  // señal al abrir el panel: son pocas filas y evita una cascada de pedidos.
  const razones: Record<string, RazonSenal[]> = {};
  for (const fila of reasons.data ?? []) {
    const lista = (razones[fila.signal_id] ??= []);
    lista.push({
      factor: fila.factor,
      etiqueta: fila.etiqueta,
      aporte: Number(fila.aporte),
    });
  }

  const evidencias: Record<string, EvidenciaSenal[]> = {};
  for (const fila of evidence.data ?? []) {
    const enlace = Array.isArray(fila.mad_evidence_links)
      ? fila.mad_evidence_links[0]
      : fila.mad_evidence_links;
    if (!enlace) continue;

    const lista = (evidencias[fila.signal_id] ??= []);
    lista.push({
      id: enlace.id,
      claimKind: enlace.claim_kind,
      fragmento: enlace.fragmento,
      limitaciones: enlace.limitaciones,
      registroRef: enlace.registro_ref,
    });
  }

  return { puntos, senales, razones, evidencias, diagnosticos };
});
