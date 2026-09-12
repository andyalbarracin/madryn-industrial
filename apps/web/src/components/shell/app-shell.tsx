import type { ReactNode } from 'react';

import { cerrarSesion } from '@/app/(auth)/login/actions';
import { SidebarNav } from '@/components/shell/sidebar-nav';
import type { MadMembership } from '@/lib/dal';
import type { MadNavItem } from '@/lib/routes';

/**
 * Shell de la app: sidebar + header. Server Component — no necesita estado.
 *
 * El header dice **de qué workspace** son los datos que estás viendo. Con RLS
 * de por medio eso no es decoración: es la respuesta a "¿esto que veo es mío?".
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
    <div className="flex min-h-svh">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-zaire-border bg-zaire-surface p-4 md:flex">
        <div className="mb-6 px-3">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-zaire-fg-muted uppercase">
            ZAIRE
          </p>
          <p className="text-lg font-semibold text-zaire-fg">MADRYN</p>
        </div>

        <SidebarNav items={items} />

        <p className="mt-auto px-3 pt-6 text-[11px] leading-relaxed text-zaire-fg-muted">
          Toda señal se abre hasta su evidencia. Nada que sea inferencia se
          muestra como hecho.
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-zaire-border bg-zaire-surface px-6 py-3">
          <div className="min-w-0">
            {workspace ? (
              <>
                <p className="truncate text-sm font-medium text-zaire-fg">{workspace.nombre}</p>
                <p className="text-xs text-zaire-fg-muted">
                  {workspace.slug} · {workspace.rol}
                </p>
              </>
            ) : (
              <p className="text-sm text-zaire-warn">
                Sin workspace asignado — corré <code>006_vincular_usuario.sql</code>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden truncate text-xs text-zaire-fg-muted sm:inline">{email}</span>
            <form action={cerrarSesion}>
              <button
                type="submit"
                className="rounded-md border border-zaire-border px-3 py-1.5 text-xs text-zaire-fg-muted transition-colors hover:bg-zaire-surface-2 hover:text-zaire-fg"
              >
                Salir
              </button>
            </form>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
