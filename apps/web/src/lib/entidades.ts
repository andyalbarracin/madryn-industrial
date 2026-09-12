import 'server-only';

/**
 * Lecturas de la superficie de entidades.
 *
 * Una entidad de MADRYN no es una fila: es un pozo, un yacimiento, un proyecto o
 * una empresa **con historia**. Por eso el detalle trae su línea de tiempo y sus
 * relaciones con vigencia, no sólo sus atributos.
 *
 * Igual que en el radar, acá no se traga ningún error: lo que falla vuelve como
 * diagnóstico con el motivo y qué hacer.
 */

import { distanciaKm, type Coordenada } from '@madryn/core';
import { cache } from 'react';

import type { Diagnostico } from './radar';
import { createSupabaseServerClient } from './supabase/server';

export interface EntidadFila {
  id: string;
  tipo: string;
  nombre: string;
  provincia: string | null;
  cuenca: string | null;
  status: string;
  lon: number | null;
  lat: number | null;
  esDemo: boolean;
}

export interface EventoEntidad {
  id: string;
  tipo: string;
  descripcion: string | null;
  claimKind: string;
  ocurridoEn: string | null;
  publicadoEn: string | null;
  observadoEn: string;
}

export interface RelacionEntidad {
  id: string;
  tipo: string;
  /** Nombre de la contraparte. */
  otra: string;
  otraId: string;
  /** `true` si esta entidad es el origen de la relación. */
  esOrigen: boolean;
  desde: string | null;
  hasta: string | null;
  confidence: number | null;
  notas: string | null;
}

export interface BaseCercana {
  nombre: string;
  km: number;
  radioKm: number;
  dentro: boolean;
}

export interface DetalleEntidad {
  entidad: EntidadFila;
  eventos: EventoEntidad[];
  relaciones: RelacionEntidad[];
  /** Bases del espacio de trabajo, ordenadas por cercanía. */
  bases: BaseCercana[];
}

function esObjetoInexistente(code: string | undefined): boolean {
  return code === '42P01' || code === 'PGRST205';
}

/** Listado completo. Son decenas de miles como techo, no millones: entra de una. */
export const getEntidades = cache(
  async (): Promise<{ filas: EntidadFila[]; diagnosticos: Diagnostico[] }> => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('mad_entities')
      .select('id, entity_type, nombre_canonico, provincia, cuenca, status, attrs')
      .is('deleted_at', null)
      .order('nombre_canonico', { ascending: true })
      .limit(5000);

    if (error) {
      return {
        filas: [],
        diagnosticos: [
          {
            nivel: 'error',
            titulo: 'No se pudieron leer las entidades',
            detalle: `${error.code ?? 'sin código'}: ${error.message}`,
            accion: esObjetoInexistente(error.code)
              ? 'Correr 002_mad_entities.sql en el editor SQL.'
              : 'Revisar las políticas de mad_entities.',
          },
        ],
      };
    }

    // Las coordenadas vienen de la vista, que las entrega como números.
    const geo = await supabase.from('mad_entities_geo').select('id, lon, lat');
    const porId = new Map((geo.data ?? []).map((g) => [g.id, g]));

    const filas: EntidadFila[] = (data ?? []).map((fila) => {
      const coords = porId.get(fila.id);
      const attrs = (fila.attrs ?? {}) as Record<string, unknown>;
      return {
        id: fila.id,
        tipo: fila.entity_type,
        nombre: fila.nombre_canonico,
        provincia: fila.provincia,
        cuenca: fila.cuenca,
        status: fila.status,
        lon: coords ? Number(coords.lon) : null,
        lat: coords ? Number(coords.lat) : null,
        esDemo: attrs['demo'] === 'true' || attrs['demo'] === true,
      };
    });

    return { filas, diagnosticos: [] };
  },
);

/**
 * Detalle de una entidad.
 *
 * La distancia a cada base se calcula acá con la función pura del paquete de
 * lógica, no en la base: es el mismo cálculo que alimenta el encaje geográfico
 * del puntaje, así que tiene que dar exactamente lo mismo en los dos lugares.
 */
export const getDetalleEntidad = cache(async (id: string): Promise<DetalleEntidad | null> => {
  const supabase = await createSupabaseServerClient();

  const [entidad, eventos, salientes, entrantes, bases] = await Promise.all([
    supabase
      .from('mad_entities')
      .select('id, entity_type, nombre_canonico, provincia, cuenca, status, attrs')
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('mad_entity_events')
      .select('id, event_type, descripcion, claim_kind, occurred_at, published_at, observed_at')
      .eq('entity_id', id)
      .order('occurred_at', { ascending: false, nullsFirst: false }),
    supabase
      .from('mad_entity_relations')
      .select(
        'id, relation_type, valid_from, valid_to, confidence, notas, dst_entity_id, destino:mad_entities!mad_entity_relations_dst_entity_id_fkey(nombre_canonico)',
      )
      .eq('src_entity_id', id),
    supabase
      .from('mad_entity_relations')
      .select(
        'id, relation_type, valid_from, valid_to, confidence, notas, src_entity_id, origen:mad_entities!mad_entity_relations_src_entity_id_fkey(nombre_canonico)',
      )
      .eq('dst_entity_id', id),
    supabase.from('mad_workspace_bases_geo').select('nombre, radio_km, lon, lat'),
  ]);

  if (entidad.error || !entidad.data) return null;

  const geo = await supabase.from('mad_entities_geo').select('lon, lat').eq('id', id).maybeSingle();
  const attrs = (entidad.data.attrs ?? {}) as Record<string, unknown>;

  const fila: EntidadFila = {
    id: entidad.data.id,
    tipo: entidad.data.entity_type,
    nombre: entidad.data.nombre_canonico,
    provincia: entidad.data.provincia,
    cuenca: entidad.data.cuenca,
    status: entidad.data.status,
    lon: geo.data ? Number(geo.data.lon) : null,
    lat: geo.data ? Number(geo.data.lat) : null,
    esDemo: attrs['demo'] === 'true' || attrs['demo'] === true,
  };

  const nombreDe = (valor: unknown): string => {
    const objeto = Array.isArray(valor) ? valor[0] : valor;
    if (objeto && typeof objeto === 'object' && 'nombre_canonico' in objeto) {
      return String((objeto as { nombre_canonico: unknown }).nombre_canonico);
    }
    return 'Entidad sin nombre';
  };

  const relaciones: RelacionEntidad[] = [
    ...(salientes.data ?? []).map((r) => ({
      id: r.id,
      tipo: r.relation_type,
      otra: nombreDe(r.destino),
      otraId: r.dst_entity_id,
      esOrigen: true,
      desde: r.valid_from,
      hasta: r.valid_to,
      confidence: r.confidence === null ? null : Number(r.confidence),
      notas: r.notas,
    })),
    ...(entrantes.data ?? []).map((r) => ({
      id: r.id,
      tipo: r.relation_type,
      otra: nombreDe(r.origen),
      otraId: r.src_entity_id,
      esOrigen: false,
      desde: r.valid_from,
      hasta: r.valid_to,
      confidence: r.confidence === null ? null : Number(r.confidence),
      notas: r.notas,
    })),
  ];

  const punto: Coordenada | null =
    fila.lat === null || fila.lon === null ? null : { lat: fila.lat, lon: fila.lon };

  const cercanas: BaseCercana[] =
    punto === null
      ? []
      : (bases.data ?? [])
          .flatMap((base) => {
            const lat = Number(base.lat);
            const lon = Number(base.lon);
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) return [];
            const km = distanciaKm(punto, { lat, lon });
            const radioKm = Number(base.radio_km);
            return [{ nombre: String(base.nombre), km, radioKm, dentro: km <= radioKm }];
          })
          .sort((a, b) => a.km - b.km);

  return {
    entidad: fila,
    eventos: (eventos.data ?? []).map((e) => ({
      id: e.id,
      tipo: e.event_type,
      descripcion: e.descripcion,
      claimKind: e.claim_kind,
      ocurridoEn: e.occurred_at,
      publicadoEn: e.published_at,
      observadoEn: e.observed_at,
    })),
    relaciones,
    bases: cercanas,
  };
});
