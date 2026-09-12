export default function Loading() {
  return (
    <div className="mad-grid flex h-full items-center justify-center" aria-busy="true" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        {/* Barrido: la misma gramática que el resto de la interfaz. */}
        <span className="flex gap-1" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="h-6 w-0.5 animate-pulse bg-mad-accent"
              style={{ animationDelay: `${i * 120}ms`, opacity: 0.25 + i * 0.15 }}
            />
          ))}
        </span>
        <p className="mad-label">Cargando</p>
      </div>
    </div>
  );
}
