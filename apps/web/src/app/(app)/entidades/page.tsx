import { notFound } from 'next/navigation';

import { SeccionEnConstruccion } from '@/components/shell/seccion-en-construccion';
import { requireUser } from '@/lib/dal';
import { isFeatureEnabled } from '@/lib/features';

export const metadata = { title: 'Entidades — MADRYN' };

export default async function EntidadesPage() {
  if (!isFeatureEnabled('entidades')) notFound();
  await requireUser();

  return (
    <SeccionEnConstruccion
      titulo="Entidades"
      proposito="Pozos, yacimientos, proyectos mineros y empresas como entidades con historia: timeline de eventos, relaciones con valid_from/valid_to, mapa y documentos."
      falta={[
        'Mapa MapLibre con basemap PMTiles self-hosted (ADR-006) — Semana 2',
        'Perfil por entidad en /entidades/[id] con timeline de mad_entity_events — Semana 5',
        'Resolución de entidades v0: determinística por CUIT + candidatos sugeridos — Semana 3',
      ]}
    />
  );
}
