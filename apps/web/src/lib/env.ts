/**
 * Acceso a variables de entorno **públicas**.
 *
 * Todo lo que arranca con `NEXT_PUBLIC_` se incrusta en el bundle del navegador
 * y es público de hecho. Por eso acá **no entra ni un secreto**:
 * `SUPABASE_SERVICE_ROLE_KEY` se lee sólo en `lib/supabase/service.ts`, que está
 * marcado `server-only`.
 *
 * Next reemplaza `process.env.NEXT_PUBLIC_*` en tiempo de build sólo si la
 * referencia es **literal**. De ahí que estén escritas una por una y no con un
 * acceso dinámico.
 */

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  enabledFeatures: process.env.NEXT_PUBLIC_ENABLED_FEATURES,
  basemapUrl: process.env.NEXT_PUBLIC_BASEMAP_URL,
  basemapPmtiles: process.env.NEXT_PUBLIC_BASEMAP_PMTILES,
  /** Estilo del mapa base. Vacío = se usa el servicio libre por defecto. */
  basemapStyleUrl: process.env.NEXT_PUBLIC_BASEMAP_STYLE_URL,
} as const;

/**
 * Devuelve las credenciales públicas de Supabase o explota con un mensaje que
 * dice qué hacer. Falla temprano y fuerte: un cliente Supabase construido con
 * `undefined` falla después, lejos, y con un error que no ayuda.
 */
export function requireSupabasePublicEnv(): { url: string; anonKey: string } {
  const url = publicEnv.supabaseUrl;
  const anonKey = publicEnv.supabaseAnonKey;

  if (!url || !anonKey) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Copiá `.env.example` a `apps/web/.env.local` y completalas con el proyecto ' +
        '`madryn-dev` (ver `../.docs/08-desarrollo/SETUP.md`).',
    );
  }

  return { url, anonKey };
}
