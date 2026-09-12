import 'server-only';

/**
 * Cliente Supabase para **Server Components, Server Actions y route handlers**.
 *
 * Usa la `anon key` y la sesión del usuario que viene en las cookies: todas las
 * lecturas quedan sujetas a RLS. Es lo que queremos — la frontera de seguridad
 * son RLS + la verificación de sesión de `lib/dal.ts`.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { requireSupabasePublicEnv } from '../env';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = requireSupabasePublicEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Un Server Component no puede escribir cookies, y esto se llama
          // también desde ahí. El refresh del token lo hace `src/proxy.ts`,
          // así que ignorar acá es correcto, no un parche.
        }
      },
    },
  });
}
