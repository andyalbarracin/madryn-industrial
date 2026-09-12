import { notFound } from 'next/navigation';

import { SeccionEnConstruccion } from '@/components/shell/seccion-en-construccion';
import { requireUser } from '@/lib/dal';
import { isFeatureEnabled } from '@/lib/features';

export const metadata = { title: 'Fuentes — MADRYN' };

export default async function FuentesPage() {
  if (!isFeatureEnabled('fuentes')) notFound();
  await requireUser();

  return (
    <SeccionEnConstruccion
      titulo="Fuentes"
      proposito="Pantalla interna: qué fuente se ingirió, cuándo, con qué licencia y con qué resultado. Una corrida que nunca terminó queda visible (run sin result), no mintiendo en estado 'running'."
      falta={[
        'Cargar mad_source_registry con las 6 fuentes P1/P2: licencia, método de acceso y si tienen datos personales — antes de la primera ingesta',
        'Conector #1 en ingestion/ (Python + httpx) escribiendo mad_ingestion_runs — Semana 2',
        'Lectura de la vista mad_ingestion_runs_estado — cuando exista la primera corrida',
      ]}
    />
  );
}
