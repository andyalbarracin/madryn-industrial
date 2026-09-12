import { notFound } from 'next/navigation';

import { SeccionEnConstruccion } from '@/components/shell/seccion-en-construccion';
import { requireUser } from '@/lib/dal';
import { isFeatureEnabled } from '@/lib/features';

export const metadata = { title: 'Curación — MADRYN' };

export default async function CuracionPage() {
  if (!isFeatureEnabled('curacion')) notFound();
  await requireUser();

  return (
    <SeccionEnConstruccion
      titulo="Curación"
      proposito="Panel del operador: aprobar, editar o descartar cada señal antes de que la vea el cliente. Nada se publica automático — eso es decisión de producto, no una limitación técnica."
      falta={[
        'Señales generadas por reglas a partir de eventos — Semana 4',
        'Asiento de decisión en mad_curation_log (aprobada/editada/descartada) — Semana 5',
        'Chequeo de rol: sólo owner y operador curan — pendiente de función pura en packages/core',
      ]}
    />
  );
}
