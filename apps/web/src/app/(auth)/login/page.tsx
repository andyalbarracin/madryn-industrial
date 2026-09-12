import Link from 'next/link';

import { LoginForm } from '@/components/auth/login-form';

export const metadata = { title: 'Entrar — MADRYN' };

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const params = await searchParams;
  const raw = params.next;
  const next = typeof raw === 'string' ? raw : '/radar';

  return (
    <div>
      <h1 className="text-2xl font-medium text-mad-fg">Entrar</h1>
      <p className="mt-2 text-sm text-mad-fg-dim">
        Estación de inteligencia territorial. Acceso restringido a equipos habilitados.
      </p>

      <div className="mt-8">
        <LoginForm next={next} />
      </div>

      <p className="mt-6 border-t border-mad-line pt-5 text-xs text-mad-fg-faint">
        ¿No tenés cuenta?{' '}
        <Link href="/registro" className="text-mad-highlight transition-colors hover:text-mad-fg">
          Crear una
        </Link>
      </p>
    </div>
  );
}
