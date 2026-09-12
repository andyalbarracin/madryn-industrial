/**
 * `@madryn/core` — lógica pura de MADRYN.
 *
 * Regla: acá no entra nada que haga I/O, lea `process.env`, importe React o
 * hable con Supabase. Todo lo de acá se testea con Vitest sin mocks.
 */

export { MAD_FEATURES, isFeatureEnabled, parseEnabledFeatures } from './features';
export type { MadFeature } from './features';

export {
  ACTION_TYPES,
  CLAIM_KINDS,
  CURATION_DECISIONS,
  SCORE_KINDS,
  SIGNAL_STATUSES,
} from './domain';
export type {
  ActionType,
  ClaimKind,
  Confidence,
  CurationDecision,
  Score,
  ScoreKind,
  SignalStatus,
} from './domain';
