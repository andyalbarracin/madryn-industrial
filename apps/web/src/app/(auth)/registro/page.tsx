import Link from 'next/link';

import { SignupForm } from '@/components/auth/signup-form';

export const metadata = { title: 'Crear cuenta — MADRYN' };

export default async function RegistroPage({ searchParams }: PageProps<'/registro'>) {
  const params = await searchParams;
  const raw = params.next;
  const next = typeof raw === 'string' ? raw : '/radar';

  return (
    <div>
      <h1 className="text-2xl font-medium text-mad-fg">Crear cuenta</h1>
      <p className="mt-2 text-sm text-mad-fg-dim">
        La cuenta se crea al instante. El acceso a un espacio de trabajo lo asigna un administrador.
      </p>

      <div className="mt-8">
        <SignupForm next={next} />
      </div>

      <p className="mt-6 border-t border-mad-line pt-5 text-xs text-mad-fg-faint">
        ¿Ya tenés cuenta?{' '}
        <Link href="/login" className="text-mad-highlight transition-colors hover:text-mad-fg">
          Entrar
        </Link>
      </p>
    </div>
  );
}
