import type { ReactNode } from 'react';

import { AppShell } from '@/components/shell/app-shell';
import { getActiveWorkspace, requireUser } from '@/lib/dal';
import { isFeatureEnabled } from '@/lib/features';
import { MAD_NAV } from '@/lib/routes';

/**
 * Layout de todo lo privado.
 *
 * `requireUser()` acá **no reemplaza** la verificación de cada página: un layout
 * no protege a sus hijas por sí solo (pueden renderizarse en navegaciones donde
 * el layout no se vuelve a ejecutar). Cada página que lee datos vuelve a pedir
 * sesión por el DAL, y RLS niega igual. Esto es la primera línea, no la única.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const workspace = await getActiveWorkspace();

  const items = MAD_NAV.filter((item) => isFeatureEnabled(item.feature));

  return (
    <AppShell items={items} email={user.email} workspace={workspace}>
      {children}
    </AppShell>
  );
}
