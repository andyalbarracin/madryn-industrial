/**
 * `proxy.ts` — deny-by-default en el borde. (En Next 16 esto es lo que antes se
 * llamaba `middleware.ts`; el archivo tiene que exportar una función `proxy`.)
 *
 * Hace exactamente dos cosas, las dos de red:
 *  1. **Refresca el token** de Supabase y reescribe las cookies. Hace falta acá
 *     porque un Server Component no puede escribir cookies.
 *  2. **Redirige al login** si no hay sesión y la ruta no es pública.
 *
 * Lo que **no** es: la frontera de seguridad. Eso son RLS + `lib/dal.ts`.
 * Autorizar sólo en middleware es un antipatrón conocido, y Next 16.1 limita
 * este archivo a tareas de red en el edge. Si alguien saltea el proxy, RLS y el
 * DAL siguen negando. El redirect es conveniencia de UX.
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/** Rutas accesibles sin sesión. Todo lo demás está denegado por default. */
const PUBLIC_PATHS = ['/login', '/auth', '/error'] as const;

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sin credenciales no hay sesión que refrescar ni a quién autenticar. Dejar
  // pasar: el error explicado lo tira `requireSupabasePublicEnv()` en la página,
  // que es donde se puede leer. Un redirect en loop acá no le dice nada a nadie.
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // `getUser()` y no `getSession()`: valida el token contra Supabase en vez de
  // creerle a la cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicPath(request.nextUrl.pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = '';
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  /**
   * Todo menos estáticos de Next y assets. `.pmtiles` y los glifos del basemap
   * quedan afuera a propósito: MapLibre hace cientos de range requests por
   * sesión y no tienen nada que ver con la sesión del usuario (ADR-006).
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|pbf|pmtiles)$).*)',
  ],
};
