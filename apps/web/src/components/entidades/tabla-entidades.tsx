'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import type { EntidadFila } from '@/lib/entidades';

/**
 * Listado de entidades con filtros.
 *
 * Filtra en el navegador porque el conjunto entero ya está acá: pedirle a la
 * base una consulta por cada tecla sería peor para todos. Cuando el volumen lo
 * justifique, la consulta se mueve al servidor y este componente no cambia.
 */

const TODOS = '__todos__';

export function TablaEntidades({ filas }: { filas: readonly EntidadFila[] }) {
  const [texto, setTexto] = useState('');
  const [tipo, setTipo] = useState<string>(TODOS);
  const [provincia, setProvincia] = useState<string>(TODOS);

  const tipos = useMemo(
    () => [...new Set(filas.map((f) => f.tipo))].sort((a, b) => a.localeCompare(b, 'es')),
    [filas],
  );
  const provincias = useMemo(
    () =>
      [...new Set(filas.map((f) => f.provincia).filter((p): p is string => p !== null))].sort(
        (a, b) => a.localeCompare(b, 'es'),
      ),
    [filas],
  );

  const visibles = useMemo(() => {
    const buscado = texto.trim().toLowerCase();
    return filas.filter((f) => {
      if (tipo !== TODOS && f.tipo !== tipo) return false;
      if (provincia !== TODOS && f.provincia !== provincia) return false;
      if (buscado && !f.nombre.toLowerCase().includes(buscado)) return false;
      return true;
    });
  }, [filas, texto, tipo, provincia]);

  const claseSelect =
    'rounded-mad border border-mad-line bg-mad-surface-inset px-2.5 py-1.5 text-xs text-mad-fg outline-none focus:border-mad-accent';

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* ── Filtros ───────────────────────────────────────────────────────── */}
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-mad-line px-6 py-3">
        <input
          type="search"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Buscar por nombre"
          aria-label="Buscar entidades por nombre"
          className="w-56 rounded-mad border border-mad-line bg-mad-surface-inset px-3 py-1.5 text-xs text-mad-fg placeholder:text-mad-fg-faint outline-none focus:border-mad-accent"
        />

        <label className="flex items-center gap-2 text-xs text-mad-fg-faint">
          Tipo
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={claseSelect}>
            <option value={TODOS}>Todos</option>
            {tipos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs text-mad-fg-faint">
          Provincia
          <select
            value={provincia}
            onChange={(e) => setProvincia(e.target.value)}
            className={claseSelect}
          >
            <option value={TODOS}>Todas</option>
            {provincias.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <p className="ml-auto text-xs tabular-nums text-mad-fg-faint">
          {visibles.length} de {filas.length}
        </p>
      </div>

      {/* ── Tabla ─────────────────────────────────────────────────────────── */}
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-mad-surface">
            <tr className="border-b border-mad-line text-left">
              <th className="mad-label px-6 py-2.5 font-medium">Nombre</th>
              <th className="mad-label px-3 py-2.5 font-medium">Tipo</th>
              <th className="mad-label px-3 py-2.5 font-medium">Provincia</th>
              <th className="mad-label px-3 py-2.5 font-medium">Cuenca</th>
              <th className="mad-label px-3 py-2.5 font-medium">Estado</th>
              <th className="mad-label px-3 py-2.5 font-medium">Ubicación</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((fila) => (
              <tr
                key={fila.id}
                className="border-b border-mad-line transition-colors hover:bg-mad-surface-raised"
              >
                <td className="px-6 py-2.5">
                  <Link
                    href={`/entidades/${fila.id}`}
                    className="text-mad-fg transition-colors hover:text-mad-highlight"
                  >
                    {fila.nombre}
                  </Link>
                  {fila.esDemo ? (
                    <span
                      title="Dato sembrado para demostración. No es un hecho de fuente."
                      className="ml-2 rounded-xs border border-mad-line px-1 py-px text-[9px] tracking-wide text-mad-attention uppercase"
                    >
                      demo
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2.5 text-xs text-mad-fg-dim">{fila.tipo}</td>
                <td className="px-3 py-2.5 text-xs text-mad-fg-dim">{fila.provincia ?? '—'}</td>
                <td className="px-3 py-2.5 text-xs text-mad-fg-dim">{fila.cuenca ?? '—'}</td>
                <td className="px-3 py-2.5 text-xs">
                  <span
                    className={`flex items-center gap-1.5 ${
                      fila.status === 'activa' ? 'text-mad-ok' : 'text-mad-fg-faint'
                    }`}
                  >
                    <span className="mad-dot" />
                    {fila.status}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-xs tabular-nums text-mad-fg-faint">
                  {fila.lat === null || fila.lon === null
                    ? 'sin coordenadas'
                    : `${fila.lat.toFixed(2)}, ${fila.lon.toFixed(2)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {visibles.length === 0 ? (
          <p className="px-6 py-8 text-center text-xs text-mad-fg-faint">
            Ninguna entidad coincide con los filtros.
          </p>
        ) : null}
      </div>
    </div>
  );
}
