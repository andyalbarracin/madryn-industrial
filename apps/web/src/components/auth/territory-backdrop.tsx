/**
 * Fondo del panel de presentación: un territorio abstracto visto desde arriba.
 *
 * No es una decoración genérica ni una foto de stock: es la misma gramática que
 * usa el producto —grilla técnica, trazas finas, nodos con densidad— así que la
 * pantalla de acceso ya dice qué es MADRYN antes de entrar.
 *
 * Todo es SVG dibujado a mano y determinístico: sin dependencias, sin pedidos a
 * la red, sin números al azar que cambien entre servidor y cliente.
 */

/** Nodos: [x, y, radio, activo]. El radio representa densidad de actividad. */
const NODOS: readonly (readonly [number, number, number, boolean])[] = [
  [180, 210, 2, false],
  [232, 268, 3, false],
  [205, 322, 2, false],
  [268, 344, 5, true],
  [318, 300, 2, false],
  [296, 402, 3, false],
  [244, 438, 2, false],
  [352, 452, 2, false],
  [402, 398, 3, false],
  [330, 528, 2, false],
  [286, 574, 4, false],
  [378, 596, 2, false],
  [430, 540, 2, false],
  [258, 650, 3, false],
  [324, 688, 2, false],
  [408, 712, 6, true],
  [462, 660, 2, false],
  [356, 780, 2, false],
  [300, 812, 3, false],
  [424, 842, 2, false],
  [478, 786, 2, false],
  [386, 894, 3, false],
  [330, 930, 2, false],
  [452, 936, 2, false],
];

export function TerritoryBackdrop() {
  return (
    <svg
      viewBox="0 0 640 1040"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        {/* Iluminación fría de la región seleccionada. Degradado funcional:
            marca dónde hay actividad, no adorna. */}
        <radialGradient id="mad-region" cx="46%" cy="62%" r="46%">
          <stop offset="0%" stopColor="#4F7CD9" stopOpacity="0.16" />
          <stop offset="55%" stopColor="#0B2D6B" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#0B2D6B" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="mad-traza" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4F7CD9" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#A7C7F7" stopOpacity="0.12" />
        </linearGradient>

        {/* Micro-grilla: textura de carta técnica. */}
        <pattern id="mad-malla" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="#1E2733" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width="640" height="1040" fill="url(#mad-malla)" />
      <rect width="640" height="1040" fill="url(#mad-region)" />

      {/* Paralelos: curvas largas y tenues, como líneas de proyección. */}
      <g fill="none" stroke="#2A3441" strokeWidth="1">
        <path d="M-40 180C120 150 320 220 680 170" />
        <path d="M-40 400C140 372 300 452 680 392" />
        <path d="M-40 620C120 596 340 668 680 608" />
        <path d="M-40 840C160 812 320 884 680 824" />
      </g>

      {/* Contorno territorial: una costa y un límite interior. Abstracto a
          propósito — no afirma ser ninguna geografía real. */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M150 120C210 190 178 268 232 330C286 392 250 470 292 540C334 610 268 690 318 760C368 830 320 918 372 1000"
          stroke="#566377"
          strokeWidth="1.25"
          strokeOpacity="0.55"
        />
        <path
          d="M420 160C392 250 452 318 428 412C404 506 470 566 442 664C414 762 486 820 458 920"
          stroke="#2A3441"
          strokeWidth="1"
        />
      </g>

      {/* Trazas de ruta entre nodos activos. */}
      <g fill="none" stroke="url(#mad-traza)" strokeWidth="1.25">
        <path d="M268 344L402 398L408 712" />
        <path d="M268 344L286 574L408 712" />
        <path d="M408 712L386 894" strokeDasharray="3 5" />
      </g>

      {/* Nodos. El punto grande con halo es el objeto seleccionado: es el único
          brillo de toda la composición. */}
      <g>
        {NODOS.map(([x, y, r, activo]) => (
          <g key={`${x}-${y}`}>
            {activo ? (
              <>
                <circle cx={x} cy={y} r={r * 4} fill="#4F7CD9" fillOpacity="0.10" />
                <circle cx={x} cy={y} r={r * 2.2} fill="#4F7CD9" fillOpacity="0.18" />
                <circle cx={x} cy={y} r={r} fill="#A7C7F7" />
              </>
            ) : (
              <circle cx={x} cy={y} r={r} fill="#566377" fillOpacity="0.8" />
            )}
          </g>
        ))}
      </g>
    </svg>
  );
}
