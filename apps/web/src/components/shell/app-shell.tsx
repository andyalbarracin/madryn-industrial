import type { ReactNode } from 'react';

import { cerrarSesion } from '@/app/(auth)/actions';
import { TopNav } from '@/components/shell/top-nav';
import type { MadMembership } from '@/lib/dal';
import type { MadNavItem } from '@/lib/routes';

/**
 * Chasis de la aplicación: barra superior y área de trabajo a pantalla completa.
 *
 * La navegación va arriba y no al costado, porque el costado izquierdo lo ocupa
 * el riel de capas del territorio. Dos rieles verticales compitiendo por el
 * mismo borde confunden qué hace cada uno.
 *
 * La barra dice **de qué espacio de trabajo** son los datos. Con aislamiento por
 * fila de por medio, eso no es decoración: responde "¿esto que veo es mío?".
 */
export function AppShell({
  children,
  items,
  email,
  workspace,
}: {
  children: ReactNode;
  items: readonly MadNavItem[];
  email: string | undefined;
  workspace: MadMembership | null;
}) {
  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <header className="flex shrink-0 items-center gap-6 border-b border-mad-line bg-mad-surface px-4">
        {/* Marca */}
        <div className="flex shrink-0 items-center gap-2.5 py-2.5">
          <svg viewBox="0 0 32 32" aria-hidden className="h-6 w-6">
            <g fill="none" stroke="#4F7CD9" strokeLinecap="round">
              <path d="M6 24a12 12 0 0 1 20-9" strokeOpacity=".38" strokeWidth="1.5" />
              <path d="M11 24a7 7 0 0 1 10.6-6" strokeOpacity=".6" strokeWidth="1.5" />
              <path d="M8.5 24h15" stroke="#566377" strokeOpacity=".7" strokeWidth="1.2" />
              <path d="M16 24 24.4 9.8" stroke="#A7C7F7" strokeWidth="2" />
            </g>
            <circle cx="22.3" cy="12.4" r="1.9" fill="#A7C7F7" />
          </svg>
          <span className="text-[13px] font-semibold tracking-[0.2em] text-mad-fg">MADRYN</span>
        </div>

        <TopNav items={items} />

        {/* Contexto y sesión */}
        <div className="ml-auto flex shrink-0 items-center gap-4 py-2">
          {workspace ? (
            <div className="hidden text-right leading-tight sm:block">
              <p className="truncate text-xs font-medium text-mad-fg">{workspace.nombre}</p>
              <p className="mad-label mt-0.5">
                {workspace.slug} · {workspace.rol}
              </p>
            </div>
          ) : (
            <p className="hidden text-right text-[11px] leading-tight text-mad-attention sm:block">
              Sin espacio de trabajo asignado
              <span className="mad-label mt-0.5 block">Correr 008</span>
            </p>
          )}

          <span aria-hidden className="h-6 w-px bg-mad-line" />

          <div className="flex items-center gap-3">
            <span className="hidden max-w-56 truncate text-[11px] text-mad-fg-faint lg:inline">
              {email}
            </span>
            <form action={cerrarSesion}>
              <button
                type="submit"
                className="rounded-mad border border-mad-line px-3 py-1.5 text-[11px] text-mad-fg-dim transition-colors hover:border-mad-line-strong hover:text-mad-fg"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
