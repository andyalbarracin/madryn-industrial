import 'server-only';

/**
 * Cliente Supabase con **service role**. SALTEA RLS POR DISEÑO.
 *
 * Reglas de uso, no negociables (regla de oro 4):
 * - `import 'server-only'` arriba: si alguien lo importa desde un Client
 *   Component, **el build falla**. Esa es la red de seguridad, no la buena fe.
 * - La key se lee de `SUPABASE_SERVICE_ROLE_KEY`, que **jamás** va en un
 *   `NEXT_PUBLIC_*`.
 * - Se usa sólo donde la ingesta o una tarea de sistema necesita escribir en la
 *   capa pública compartida. Para cualquier lectura de usuario va
 *   `createSupabaseServerClient()`, que respeta RLS.
 */

import { createClient } from '@supabase/supabase-js';

import { requireSupabasePublicEnv } from '../env';

export function createSupabaseServiceClient() {
  const { url } = requireSupabasePublicEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      'Falta SUPABASE_SERVICE_ROLE_KEY. Es server-only: va en `apps/web/.env.local` ' +
        '(o en el entorno de Vercel), nunca en una variable NEXT_PUBLIC_.',
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
