import 'server-only';

/**
 * Data Access Layer — **la frontera de seguridad real** de MADRYN, junto con RLS.
 *
 * `src/proxy.ts` redirige al login por conveniencia de UX, pero no es frontera:
 * autorizar sólo en middleware es un antipatrón conocido. Toda página o action
 * que toque datos de un workspace empieza pidiendo la sesión **acá**.
 *
 * `auth.getUser()` y no `getSession()`: `getUser()` valida el token contra
 * Supabase. `getSession()` confía en la cookie, que el cliente controla.
 *
 * `react.cache` deduplica la verificación dentro de un mismo render: diez
 * componentes pueden pedir el usuario y se hace una sola llamada.
 */

import type { User } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import { createSupabaseServerClient } from './supabase/server';

/** Roles de `mad_workspace_members.rol`. Espejo del `check` en SQL 003. */
export type MadRole = 'owner' | 'operador' | 'comercial' | 'lector';

export interface MadMembership {
  workspaceId: string;
  slug: string;
  nombre: string;
  rol: MadRole;
}

/** El usuario verificado, o `null` si no hay sesión válida. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
});

/** El usuario verificado o redirect al login. Lo que usa toda página privada. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

/**
 * Workspaces del usuario. RLS ya filtra por membresía; el `deleted_at is null`
 * es por el soft-delete.
 *
 * Devuelve `[]` si la consulta falla (típico: el SQL todavía no se corrió en
 * este proyecto Supabase). Una pantalla vacía es mejor que un 500.
 */
export const getMemberships = cache(async (): Promise<MadMembership[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('mad_workspace_members')
    .select('workspace_id, rol, mad_workspaces!inner(slug, nombre, deleted_at)')
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  return data.flatMap((row): MadMembership[] => {
    // El embed `!inner` puede venir como objeto o como array según la relación.
    const ws = Array.isArray(row.mad_workspaces) ? row.mad_workspaces[0] : row.mad_workspaces;
    if (!ws || ws.deleted_at !== null) return [];
    return [
      {
        workspaceId: row.workspace_id,
        slug: ws.slug,
        nombre: ws.nombre,
        rol: row.rol as MadRole,
      },
    ];
  });
});

/**
 * El workspace activo. Hoy: el primero del usuario.
 *
 * **Gancho declarado:** selector de workspace (cookie `mad_ws` + switcher en el
 * header). No se construye en el MVP porque cada design partner arranca con uno.
 */
export const getActiveWorkspace = cache(async (): Promise<MadMembership | null> => {
  const memberships = await getMemberships();
  return memberships[0] ?? null;
});
