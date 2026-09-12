'use client';

/**
 * Límite de error. Muestra el mensaje real: es una herramienta interna, y
 * esconder la causa sólo alarga el diagnóstico.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <section className="mad-panel w-full max-w-2xl">
        <header className="border-b border-mad-line px-5 py-4">
          <p className="mad-label text-mad-alert">Fallo</p>
          <h1 className="mt-1.5 text-lg font-medium text-mad-fg">No pudimos cargar esta sección</h1>
        </header>

        <div className="px-5 py-4">
          <p className="text-sm text-mad-fg-dim">
            Si el proyecto de base de datos es nuevo, es probable que falte aplicar el esquema.
          </p>

          <pre className="mt-4 overflow-x-auto rounded-mad border border-mad-line bg-mad-surface-inset p-4 text-xs leading-relaxed text-mad-alert">
            {error.message}
            {error.digest ? `\n\ndigest: ${error.digest}` : ''}
          </pre>

          <button
            type="button"
            onClick={reset}
            className="mt-4 rounded-mad bg-mad-accent px-4 py-2 text-sm font-medium text-[#06101F] transition-colors hover:bg-mad-highlight"
          >
            Reintentar
          </button>
        </div>
      </section>
    </div>
  );
}
