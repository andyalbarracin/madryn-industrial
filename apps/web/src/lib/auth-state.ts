/**
 * Estado que devuelven las acciones de sesión.
 *
 * Vive fuera de `(auth)/actions.ts` porque un archivo `'use server'` sólo puede
 * exportar funciones async: exportar una constante desde ahí rompe la
 * compilación. El tipo y el valor inicial no son acciones, así que van acá.
 */

export interface AuthState {
  /** Algo salió mal y el usuario tiene que corregirlo. */
  error: string | null;
  /** Salió bien pero hay algo que el usuario necesita saber. */
  aviso: string | null;
}

export const ESTADO_AUTH_INICIAL: AuthState = { error: null, aviso: null };
