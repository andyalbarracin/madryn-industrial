/**
 * Las sub-superficies de MADRYN, en un solo lugar.
 *
 * Cada una está atada a una `MadFeature`, así que el sidebar y el gating no se
 * pueden desincronizar: si la feature está apagada, el ítem no se renderiza.
 */

import type { MadFeature } from '@madryn/core';

export interface MadNavItem {
  href: string;
  label: string;
  feature: MadFeature;
  /** Qué está construido de verdad hoy. Honestidad de estado: nunca disfrazar roadmap de disponible. */
  estado: 'hecho' | 'roadmap';
}

export const MAD_NAV: readonly MadNavItem[] = [
  { href: '/radar', label: 'Radar', feature: 'radar', estado: 'roadmap' },
  { href: '/entidades', label: 'Entidades', feature: 'entidades', estado: 'roadmap' },
  { href: '/curacion', label: 'Curación', feature: 'curacion', estado: 'roadmap' },
  { href: '/watchlists', label: 'Watchlists', feature: 'watchlists', estado: 'roadmap' },
  { href: '/fuentes', label: 'Fuentes', feature: 'fuentes', estado: 'roadmap' },
] as const;
