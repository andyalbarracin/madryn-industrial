import 'server-only';

/**
 * Lecturas de la pantalla de radar.
 *
 * Todo pasa por el cliente con la sesión del usuario, así que RLS decide qué
 * sale. Si una consulta falla —típico: el esquema todavía no se aplicó en este
 * proyecto— se devuelve vacío y la pantalla lo dice. Una pantalla que explica
 * que está vacía es mejor que un error 500.
 */

import { cache } from 'react';

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

/** Entidades geolocalizadas para dibujar el mapa. */
export const getPuntosEntidades = cache(async (): Promise<PuntoEntidad[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('mad_entities_geo')
    .select('id, entity_type, nombre_canonico, provincia, lon, lat, es_demo')
    .limit(2000);

  if (error || !data) return [];

  return data.map((fila) => ({
    id: fila.id,
    tipo: fila.entity_type,
    nombre: fila.nombre_canonico,
    provincia: fila.provincia,
    lon: Number(fila.lon),
    lat: Number(fila.lat),
    esDemo: Boolean(fila.es_demo),
  }));
});

/** Señales del workspace, las más recientes primero. */
export const getSenales = cache(async (): Promise<SenalResumen[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('mad_signals')
    .select(
      'id, titulo, summary, score, confidence, accion_sugerida, entity_id, occurred_at, publicada_at',
    )
    .order('occurred_at', { ascending: false, nullsFirst: false })
    .limit(100);

  if (error || !data) return [];

  return data.map((fila) => ({
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
});
