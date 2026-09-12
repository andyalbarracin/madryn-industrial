import { notFound } from 'next/navigation';

import { SeccionEnConstruccion } from '@/components/shell/seccion-en-construccion';
import { requireUser } from '@/lib/dal';
import { isFeatureEnabled } from '@/lib/features';

export const metadata = { title: 'Radar — MADRYN' };

export default async function RadarPage() {
  if (!isFeatureEnabled('radar')) notFound();
  // Cada página vuelve a pedir sesión: el layout es la primera línea, no la única.
  await requireUser();

  return (
    <SeccionEnConstruccion
      titulo="Radar"
      proposito="Feed curado de señales: qué pasó afuera, cómo te afecta y qué hacer. Cada señal con score (0–100), confianza (0–1) y evidencia abrible."
      falta={[
        'Primera ingesta real (producción por pozo, Secretaría de Energía) a RAW — Semana 2',
        'Entidades geolocalizadas desde esa fuente (mad_entities + geom) — Semana 2',
        'Scoring puro y testeado en packages/core (opportunity + confidence) — Semana 4',
        'Tabla del feed con filtros por provincia, servicio, relación y confianza — Semana 5',
      ]}
    />
  );
}
