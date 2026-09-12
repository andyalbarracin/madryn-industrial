import Link from 'next/link';

import { RecoveryForm } from '@/components/auth/recovery-form';

export const metadata = { title: 'Recuperar acceso — MADRYN' };

export default function RecuperarPage() {
  return (
    <div>
      <h1 className="text-2xl font-medium text-mad-fg">Recuperar acceso</h1>
      <p className="mt-2 text-sm text-mad-fg-dim">
        Te mandamos un enlace para definir una contraseña nueva.
      </p>

      <div className="mt-8">
        <RecoveryForm />
      </div>

      <p className="mt-6 border-t border-mad-line pt-5 text-xs text-mad-fg-faint">
        <Link href="/login" className="text-mad-highlight transition-colors hover:text-mad-fg">
          Volver a entrar
        </Link>
      </p>
    </div>
  );
}
