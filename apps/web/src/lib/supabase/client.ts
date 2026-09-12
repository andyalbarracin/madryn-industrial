/**
 * Cliente Supabase para el **navegador**.
 *
 * Usa la `anon key`, así que todo lo que lea pasa por RLS. Nunca importar acá
 * nada de `service.ts`.
 */

import { createBrowserClient } from '@supabase/ssr';

import { requireSupabasePublicEnv } from '../env';

export function createSupabaseBrowserClient() {
  const { url, anonKey } = requireSupabasePublicEnv();
  return createBrowserClient(url, anonKey);
}
