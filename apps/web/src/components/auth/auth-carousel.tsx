'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Carrusel de presentación del panel de acceso.
 *
 * Tres láminas, una por eje del producto. Los indicadores no son puntos mudos:
 * llevan número y etiqueta, así se puede ir directo a la lámina que interesa.
 * Avanza solo cada 8 s, y se detiene apenas el puntero o el foco entran —
 * nadie quiere que el texto salte mientras lo está leyendo.
 */

interface Lamina {
  clave: string;
  etiqueta: string;
  titulo: string;
  bajada: string;
  puntos: readonly string[];
}

const LAMINAS: readonly Lamina[] = [
  {
    clave: 'senales',
    etiqueta: 'Señales',
    titulo: 'Lo que pasa afuera, antes que el resto',
    bajada:
      'Un feed curado de oportunidades reales, no un tablero de métricas que hay que interpretar.',
    puntos: [
      'Puntaje y confianza como campos separados: un 61 con confianza 0.41 no se lee como un 61 con 0.9',
      'Cada señal llega con una acción sugerida, no sólo con un número',
      'Nada se publica sin que un operador lo apruebe',
    ],
  },
  {
    clave: 'evidencia',
    etiqueta: 'Evidencia',
    titulo: 'Toda afirmación se abre hasta su fuente',
    bajada:
      'Si no se puede mostrar de dónde salió, no se muestra como hecho. Esa es la regla, sin excepciones.',
    puntos: [
      'Se distingue un hecho de fuente de una inferencia, una predicción y una recomendación',
      'Historia inmutable: corregir un asiento se hace con un asiento nuevo',
      'Cada dato guarda cuándo ocurrió, cuándo se observó y cuándo se ingirió',
    ],
  },
  {
    clave: 'territorio',
    etiqueta: 'Territorio',
    titulo: 'La geografía como criterio, no como ilustración',
    bajada:
      'Energía, minería y obra pública ocurren en un lugar concreto. La distancia a tu base es parte del cálculo.',
    puntos: [
      'Encaje geográfico con distancia real a tus bases operativas',
      'Encaje de servicios: qué de lo que pasa podés atender vos',
      'Entidades con historia: pozos, yacimientos, proyectos y empresas',
    ],
  },
];

const INTERVALO_MS = 8000;

export function AuthCarousel() {
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);

  const avanzar = useCallback(() => {
    setIndice((actual) => (actual + 1) % LAMINAS.length);
  }, []);

  useEffect(() => {
    if (pausado) return;
    const id = window.setInterval(avanzar, INTERVALO_MS);
    return () => window.clearInterval(id);
  }, [avanzar, pausado]);

  const lamina = LAMINAS[indice] ?? LAMINAS[0];
  if (!lamina) return null;

  return (
    <div
      className="relative flex h-full flex-col justify-end p-10 xl:p-14"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={() => setPausado(false)}
    >
      <div className="max-w-xl">
        <p className="mad-label">{lamina.etiqueta}</p>

        <h2 className="mt-3 text-3xl leading-tight font-medium text-mad-fg xl:text-[2.1rem]">
          {lamina.titulo}
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-mad-fg-dim">{lamina.bajada}</p>

        <ul className="mt-6 flex flex-col gap-3 border-t border-mad-line pt-6">
          {lamina.puntos.map((punto) => (
            <li key={punto} className="flex gap-3 text-sm leading-relaxed text-mad-fg-dim">
              <span aria-hidden className="mt-1.75 h-px w-4 shrink-0 bg-mad-accent" />
              <span>{punto}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Indicadores navegables: número + etiqueta, no puntos anónimos. */}
      <nav aria-label="Láminas de presentación" className="mt-10 flex gap-2">
        {LAMINAS.map((item, i) => {
          const activa = i === indice;
          return (
            <button
              key={item.clave}
              type="button"
              onClick={() => setIndice(i)}
              aria-current={activa ? 'true' : undefined}
              className={`group flex flex-1 flex-col gap-2 border-t pt-3 text-left transition-colors ${
                activa
                  ? 'border-mad-accent text-mad-fg'
                  : 'border-mad-line text-mad-fg-faint hover:border-mad-line-strong hover:text-mad-fg-dim'
              }`}
            >
              <span className="text-[10px] tracking-[0.14em] tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-xs font-medium">{item.etiqueta}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
