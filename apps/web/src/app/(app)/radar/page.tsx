import { notFound } from 'next/navigation';

import { CommandView } from '@/components/map/command-view';
import { requireUser } from '@/lib/dal';
import { isFeatureEnabled } from '@/lib/features';
import { getEstadoRadar } from '@/lib/radar';

export const metadata = { title: 'Radar — MADRYN' };

/**
 * Pantalla de mando. Es la primera que se ve al entrar.
 *
 * Lee en el servidor y entrega todo resuelto —incluidos los diagnósticos de lo
 * que no se pudo leer y por qué—: el territorio y el cajón necesitan estado
 * compartido, pero no necesitan traer datos por su cuenta.
 */
export default async function RadarPage() {
  if (!isFeatureEnabled('radar')) notFound();
  // Cada página vuelve a pedir sesión: el layout es la primera línea, no la única.
  await requireUser();

  const { puntos, senales, diagnosticos } = await getEstadoRadar();

  return <CommandView puntos={puntos} senales={senales} diagnosticos={diagnosticos} />;
}
