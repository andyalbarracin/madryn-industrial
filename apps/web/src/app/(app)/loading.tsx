export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse" aria-busy="true" aria-live="polite">
      <div className="h-6 w-48 rounded bg-zaire-surface-2" />
      <div className="mt-3 h-4 w-full max-w-xl rounded bg-zaire-surface-2" />
      <div className="mt-6 h-40 rounded-lg bg-zaire-surface-2" />
      <span className="sr-only">Cargando…</span>
    </div>
  );
}
