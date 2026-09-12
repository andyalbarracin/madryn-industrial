'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { MadNavItem } from '@/lib/routes';

/**
 * Navegación entre sub-superficies. Es de cliente sólo por el estado activo.
 * El filtrado por feature ya lo hizo el servidor: acá no se decide qué se puede
 * ver, sólo cómo se ve lo que ya llegó.
 */
export function TopNav({ items }: { items: readonly MadNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Secciones" className="flex min-w-0 items-stretch overflow-x-auto">
      {items.map((item) => {
        const activo = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={activo ? 'page' : undefined}
            className={`flex items-center gap-2 border-b-2 px-3.5 py-3 text-xs whitespace-nowrap transition-colors ${
              activo
                ? 'border-mad-accent text-mad-fg'
                : 'border-transparent text-mad-fg-faint hover:text-mad-fg-dim'
            }`}
          >
            {item.label}
            {item.estado === 'roadmap' ? (
              <span
                title="En construcción: todavía no muestra datos reales"
                className="rounded-xs border border-mad-line px-1 py-px text-[9px] tracking-wide text-mad-fg-faint uppercase"
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
