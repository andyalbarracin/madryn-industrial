/**
 * Gating de sub-superficies de MADRYN.
 *
 * Función pura: no lee `process.env`. Quien la llama le pasa el string crudo
 * (en la web, `NEXT_PUBLIC_ENABLED_FEATURES`). Así el cálculo es testeable y
 * `packages/core` no depende de ningún entorno.
 *
 * Deny-by-default: sin lista, nada está habilitado.
 */

/** Las sub-superficies gateables. Ver `.env.example`. */
export const MAD_FEATURES = ['radar', 'entidades', 'curacion', 'watchlists', 'fuentes'] as const;

export type MadFeature = (typeof MAD_FEATURES)[number];

function isMadFeature(value: string): value is MadFeature {
  return (MAD_FEATURES as readonly string[]).includes(value);
}

/**
 * Convierte la lista cruda en un set de features conocidas.
 * Normaliza espacios y mayúsculas; descarta lo que no reconoce (no explota:
 * una variable de entorno mal escrita no debe tumbar el render).
 */
export function parseEnabledFeatures(raw: string | undefined): ReadonlySet<MadFeature> {
  if (raw === undefined) return new Set();

  const enabled = new Set<MadFeature>();
  for (const part of raw.split(',')) {
    const name = part.trim().toLowerCase();
    if (isMadFeature(name)) enabled.add(name);
  }
  return enabled;
}

/** `true` sólo si la feature aparece explícitamente en la lista. */
export function isFeatureEnabled(feature: MadFeature, raw: string | undefined): boolean {
  return parseEnabledFeatures(raw).has(feature);
}
