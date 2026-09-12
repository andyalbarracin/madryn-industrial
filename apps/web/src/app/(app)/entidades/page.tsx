import { notFound } from 'next/navigation';

import { TablaEntidades } from '@/components/entidades/tabla-entidades';
import { PanelDiagnostico } from '@/components/map/panel-diagnostico';
import { requireUser } from '@/lib/dal';
import { getEntidades } from '@/lib/entidades';
import { isFeatureEnabled } from '@/lib/features';

export const metadata = { title: 'Entidades — MADRYN' };

export default async function EntidadesPage() {
  if (!isFeatureEnabled('entidades')) notFound();
  await requireUser();

  const { filas, diagnosticos } = await getEntidades();

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-mad-line px-6 py-3">
        <h1 className="text-sm font-medium text-mad-fg">Entidades</h1>
        <p className="mt-0.5 text-xs text-mad-fg-dim">
          Pozos, yacimientos, proyectos y empresas. Cada una con su historia, sus relaciones y su
          distancia real a tus bases.
        </p>
      </header>

      <PanelDiagnostico diagnosticos={diagnosticos} />

      <div className="min-h-0 flex-1">
        <TablaEntidades filas={filas} />
      </div>
    </div>
  );
}
