'use client';

/**
 * Error boundary de la app. Muestra el mensaje real (es una herramienta interna:
 * esconderlo sólo hace más lento el diagnóstico) y ofrece reintentar.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold text-zaire-fg">Algo se rompió</h1>
      <p className="mt-2 text-sm text-zaire-fg-muted">
        No pudimos cargar esta sección. Si acabás de crear el proyecto Supabase, puede que falte
        correr el SQL de <code>../.docs/sql/</code>.
      </p>

      <pre className="mt-4 overflow-x-auto rounded-lg border border-zaire-border bg-zaire-surface p-4 font-mono text-xs text-zaire-danger">
        {error.message}
        {error.digest ? `\n\ndigest: ${error.digest}` : ''}
      </pre>

      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-md bg-zaire-primary px-4 py-2 text-sm font-medium text-zaire-primary-fg transition-opacity hover:opacity-90"
      >
        Reintentar
      </button>
    </section>
  );
}
