'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { MadNavItem } from '@/lib/routes';

/**
 * Nav del sidebar. Es Client Component sólo por el estado activo (`usePathname`).
 * El filtrado por feature ya lo hizo el layout en el server: acá no se decide
 * qué se puede ver.
 */
export function SidebarNav({ items }: { items: readonly MadNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Secciones" className="flex flex-col gap-0.5">
      {items.map((item) => {
        const activo = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={activo ? 'page' : undefined}
            className={
              activo
                ? 'flex items-center justify-between rounded-md bg-zaire-surface-2 px-3 py-2 text-sm font-medium text-zaire-fg'
                : 'flex items-center justify-between rounded-md px-3 py-2 text-sm text-zaire-fg-muted transition-colors hover:bg-zaire-surface-2 hover:text-zaire-fg'
            }
          >
            <span>{item.label}</span>
            {item.estado === 'roadmap' ? (
              <span
                title="En construcción — todavía no muestra datos reales"
                className="rounded-sm border border-zaire-border px-1.5 py-0.5 text-[10px] tracking-wide text-zaire-fg-muted uppercase"
              >
                wip
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
