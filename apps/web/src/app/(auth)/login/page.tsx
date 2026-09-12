import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: 'Entrar — MADRYN',
};

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const params = await searchParams;
  const raw = params.next;
  const next = typeof raw === 'string' ? raw : '/radar';

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-lg border border-zaire-border bg-zaire-surface p-6 shadow-sm">
        <header className="mb-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-zaire-fg-muted uppercase">
            ZAIRE Technologies
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-zaire-fg">MADRYN</h1>
          <p className="mt-2 text-sm text-zaire-fg-muted">
            Radar de oportunidades industriales. Se entra por invitación.
          </p>
        </header>

        <LoginForm next={next} />
      </div>
    </main>
  );
}
