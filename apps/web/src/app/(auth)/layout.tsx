import Link from 'next/link';
import type { ReactNode } from 'react';

import { AuthCarousel } from '@/components/auth/auth-carousel';
import { TerritoryBackdrop } from '@/components/auth/territory-backdrop';

/**
 * Pantalla de acceso: 40 de formulario, 60 de presentación.
 *
 * En pantallas angostas el panel de presentación se oculta entero en vez de
 * apilarse. Un carrusel arriba del formulario empuja el campo de email fuera de
 * la vista y no aporta nada a quien ya sabe a qué vino.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      {/* ── 60 · Presentación (izquierda) ───────────────────────────────── */}
      <aside className="relative hidden overflow-hidden border-r border-mad-line bg-mad-surface-inset lg:block">
        <TerritoryBackdrop />
        {/* Velo inferior: el texto tiene que leerse sobre el territorio. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-[#070A0E] via-[#070A0E]/70 to-transparent"
        />
        <div className="relative h-full">
          <AuthCarousel />
        </div>
      </aside>

      {/* ── 40 · Formulario (derecha) ───────────────────────────────────── */}
      <section className="mad-depth flex flex-col justify-between px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex items-center gap-3">
          <span className="mad-brackets inline-flex h-7 w-7 items-center justify-center">
            <svg viewBox="0 0 32 32" aria-hidden className="h-5 w-5">
              <g fill="none" stroke="#4F7CD9" strokeLinecap="round">
                <path d="M6 24a12 12 0 0 1 20-9" strokeOpacity=".38" strokeWidth="1.5" />
                <path d="M11 24a7 7 0 0 1 10.6-6" strokeOpacity=".6" strokeWidth="1.5" />
                <path d="M8.5 24h15" stroke="#566377" strokeOpacity=".7" strokeWidth="1.2" />
                <path d="M16 24 24.4 9.8" stroke="#A7C7F7" strokeWidth="2" />
              </g>
              <circle cx="22.3" cy="12.4" r="1.9" fill="#A7C7F7" />
            </svg>
          </span>
          <div className="leading-none">
            <p className="text-sm font-semibold tracking-[0.22em] text-mad-fg">MADRYN</p>
            <p className="mad-label mt-1">ZAIRE Technologies</p>
          </div>
        </header>

        <main className="w-full max-w-sm py-12 lg:py-0">{children}</main>

        <footer className="flex flex-col gap-2 border-t border-mad-line pt-5 text-[11px] text-mad-fg-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ZAIRE Technologies. Todos los derechos reservados.</p>
          <p className="flex items-center gap-3">
            <Link href="/login" className="transition-colors hover:text-mad-fg-dim">
              Acceso
            </Link>
            <span aria-hidden className="h-3 w-px bg-mad-line" />
            <span>Acceso por invitación</span>
          </p>
        </footer>
      </section>
    </div>
  );
}
