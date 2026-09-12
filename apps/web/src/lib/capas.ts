/**
 * Capas del mapa.
 *
 * Una capa agrupa tipos de entidad que se leen juntos y se prenden o apagan
 * juntos desde el riel. El color va acompañado siempre de forma y tamaño: el
 * color solo nunca alcanza para comunicar de qué se trata un punto.
 */

export type ClaveCapa =
  | 'pozos'
  | 'yacimientos'
  | 'proyectos'
  | 'infraestructura'
  | 'senales'
  | 'camaras';

export interface Capa {
  clave: ClaveCapa;
  etiqueta: string;
  /** Qué se ve cuando esta capa está encendida. */
  descripcion: string;
  /** Tipos de `mad_entities.entity_type` que caen en esta capa. */
  tipos: readonly string[];
  /** Variable CSS del color del punto. */
  color: string;
  /** Radio base en píxeles del lienzo del mapa. */
  radio: number;
  /** Encendida al abrir la pantalla. */
  porDefecto: boolean;
}

export const CAPAS: readonly Capa[] = [
  {
    clave: 'senales',
    etiqueta: 'Señales',
    descripcion: 'Entidades con una señal abierta',
    tipos: [],
    color: 'var(--mad-highlight)',
    radio: 4.5,
    porDefecto: true,
  },
  {
    clave: 'proyectos',
    etiqueta: 'Proyectos',
    descripcion: 'Proyectos mineros y de obra',
    tipos: ['proyecto', 'mina'],
    color: 'var(--mad-accent)',
    radio: 4,
    porDefecto: true,
  },
  {
    clave: 'yacimientos',
    etiqueta: 'Yacimientos',
    descripcion: 'Áreas de concesión y yacimientos',
    tipos: ['yacimiento'],
    color: 'var(--mad-accent)',
    radio: 3.5,
    porDefecto: true,
  },
  {
    clave: 'pozos',
    etiqueta: 'Pozos',
    descripcion: 'Pozos de petróleo y gas',
    tipos: ['pozo'],
    color: 'var(--mad-steel)',
    radio: 2,
    porDefecto: true,
  },
  {
    clave: 'camaras',
    etiqueta: 'Cámaras',
    descripcion: 'Cámaras públicas de control vehicular',
    tipos: [],
    color: 'var(--mad-steel)',
    radio: 2,
    porDefecto: false,
  },
  {
    clave: 'infraestructura',
    etiqueta: 'Infraestructura',
    descripcion: 'Plantas, bases, instalaciones y sitios',
    tipos: ['planta', 'base', 'instalacion', 'sitio', 'infraestructura'],
    color: 'var(--mad-steel)',
    radio: 2.5,
    porDefecto: false,
  },
];

/** A qué capa pertenece un tipo de entidad. `null` si no cae en ninguna. */
export function capaDeTipo(tipo: string): ClaveCapa | null {
  for (const capa of CAPAS) {
    if (capa.tipos.includes(tipo)) return capa.clave;
  }
  return null;
}

export const CAPAS_POR_DEFECTO: readonly ClaveCapa[] = CAPAS.filter((c) => c.porDefecto).map(
  (c) => c.clave,
);
