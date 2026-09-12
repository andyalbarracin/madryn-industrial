import { notFound } from 'next/navigation';

import { SeccionEnConstruccion } from '@/components/shell/seccion-en-construccion';
import { requireUser } from '@/lib/dal';
import { isFeatureEnabled } from '@/lib/features';

export const metadata = { title: 'Watchlists — MADRYN' };

export default async function WatchlistsPage() {
  if (!isFeatureEnabled('watchlists')) notFound();
  await requireUser();

  return (
    <SeccionEnConstruccion
      titulo="Watchlists"
      proposito="Entidades y zonas que el comercial quiere seguir, con reglas que disparan señal cuando algo se mueve."
      falta={[
        'Acciones sobre señales (mad_actions + mad_feedback) — Semana 6',
        'Reglas de watchlist evaluadas en la ingesta — Semana 6',
      ]}
    />
  );
}
