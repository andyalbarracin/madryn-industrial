/**
 * Vocabulario del dominio MADRYN.
 *
 * Cada lista de acá es **espejo de un `check` del SQL** en `../.docs/sql/`.
 * Si cambia el SQL, cambia esto (y al revés). No inventar valores: el valor
 * que no está en el `check` la base lo rechaza.
 *
 * Sólo declaraciones — cero I/O, cero lógica.
 */

/**
 * Naturaleza de una afirmación (regla de oro 6: nunca presentar una inferencia
 * como hecho). Espejo de `mad_evidence_links.claim_kind`.
 */
export const CLAIM_KINDS = [
  'hecho_de_fuente',
  'inferencia',
  'prediccion',
  'recomendacion',
  'opinion_humana',
  'resultado_confirmado',
] as const;
export type ClaimKind = (typeof CLAIM_KINDS)[number];

/**
 * Status de una señal. **No vive en la fila**: se deriva on-read del último
 * asiento de `mad_signal_status_events` (append-only). Ver la vista
 * `mad_signals_con_status`.
 */
export const SIGNAL_STATUSES = ['nueva', 'vista', 'accionada', 'descartada', 'archivada'] as const;
export type SignalStatus = (typeof SIGNAL_STATUSES)[number];

/** Acción sugerida por una señal. Espejo de `mad_signals.accion_sugerida` y `mad_actions.tipo`. */
export const ACTION_TYPES = [
  'create_crm_opportunity',
  'create_task',
  'add_watchlist',
  'preparar_contacto',
  'descartar',
  'solicitar_revision',
] as const;
export type ActionType = (typeof ACTION_TYPES)[number];

/** Tipos de score calculados on-read. Espejo de `mad_scores.tipo`. */
export const SCORE_KINDS = ['opportunity', 'risk', 'fit_geo', 'fit_servicio'] as const;
export type ScoreKind = (typeof SCORE_KINDS)[number];

/** Decisión del curador humano antes de publicar (CA4). Espejo de `mad_curation_log.decision`. */
export const CURATION_DECISIONS = ['aprobada', 'editada', 'descartada', 'pendiente'] as const;
export type CurationDecision = (typeof CURATION_DECISIONS)[number];

/**
 * `score` (0–100) y `confidence` (0–1) son **campos separados** y se muestran
 * separados. Un 61 con confianza 0.41 se lee distinto que un 61 con 0.9.
 */
export type Score = number;
export type Confidence = number;
