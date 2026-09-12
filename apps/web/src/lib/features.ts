/**
 * Gating de sub-superficies, lado app.
 *
 * El cálculo vive en `@madryn/core` (puro y testeado); acá sólo se le pasa la
 * variable de entorno. Se puede usar desde Server y Client Components: la lista
 * es pública por definición.
 *
 * Ojo: `NEXT_PUBLIC_ENABLED_FEATURES` se lee en **build**. Cambiarla exige
 * redeploy, no alcanza reiniciar.
 */

import { isFeatureEnabled as isFeatureEnabledPure, type MadFeature } from '@madryn/core';

import { publicEnv } from './env';

export function isFeatureEnabled(feature: MadFeature): boolean {
  return isFeatureEnabledPure(feature, publicEnv.enabledFeatures);
}

export type { MadFeature };
