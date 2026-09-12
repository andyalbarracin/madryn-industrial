# MADRYN

Plataforma de inteligencia industrial de **ZAIRE Technologies**.

MADRYN ingiere datos públicos argentinos —energía, minería, geografía, compras
públicas— y los convierte en **señales explicables con acción sugerida**: qué
pasó afuera de tu operación, cómo te afecta y qué conviene hacer.

El primer producto es el **Industrial Opportunity Radar**.

```
¿Qué pasa DENTRO de mi operación?   → suite operativa
¿Qué pasa AFUERA y qué hago?        → MADRYN
```

## Principios de producto

- **Todo explicable, con procedencia.** Cada señal se abre hasta la evidencia
  que la sostiene. Se distingue siempre un hecho de fuente de una inferencia,
  de una predicción y de una recomendación. Nunca se presenta una inferencia
  como hecho.
- **`score` y `confidence` son campos separados.** Un 61 con confianza 0.41
  ("prometedor pero sin confirmar") no se lee igual que un 61 con 0.9. No se
  colapsan en un número ni comparten color.
- **Nada se publica sin curación humana.** Un operador aprueba, edita o descarta
  cada señal antes de que la vea el cliente. Es decisión de producto, no una
  limitación técnica.
- **Historia inmutable.** Las señales, los eventos y las corridas de ingesta son
  ledgers de sólo-agregado: corregir un asiento se hace con un asiento nuevo.
  Una relación histórica no se sobrescribe, se cierra y se abre otra.
- **Ingesta legal.** Toda fuente se registra con su licencia, su método de acceso
  y si contiene datos personales, antes de la primera descarga. La ingesta se
  identifica con un User-Agent real y de contacto.

## Estructura

```
apps/web         Next.js 16 (App Router, RSC) · TypeScript strict · Tailwind v4
packages/core    Cálculo puro y testeado: scoring, encaje, tipos de dominio
```

`packages/core` no hace I/O, no lee variables de entorno y no importa React:
los scores se calculan con funciones puras testeadas, nunca en triggers ni en
columnas persistidas.

## Stack

Next.js 16 · TypeScript strict · Tailwind CSS v4 · Supabase (Postgres + PostGIS
+ pgvector + Auth + Storage) · MapLibre GL · pnpm workspaces + Turborepo ·
Vitest. La capa de ingesta es Python (httpx + Polars + Pydantic).

## Arranque

```bash
pnpm install
cp .env.example apps/web/.env.local   # y completar las credenciales
pnpm -w dev
```

El esquema de base de datos se aplica aparte, en orden y de forma idempotente.
Sin las variables de Supabase la app arranca pero cada pantalla privada explica
qué falta.

## Gate de calidad

Ninguna tanda se integra sin esto en verde:

```bash
pnpm -w gate     # typecheck (0) · lint (0) · build (✓) · test (verde)
```

Además: RLS activa en todas las tablas, la clave de servicio sólo del lado del
servidor, y el SQL siempre aditivo e idempotente.

## Seguridad

- La frontera de autorización son **RLS en la base + verificación de sesión en
  el servidor** (`src/lib/dal.ts`). El deny-by-default del borde
  (`src/proxy.ts`) es conveniencia de UX: autorizar sólo ahí es un antipatrón.
- La clave de servicio saltea RLS por diseño, así que vive detrás de
  `server-only`: si un componente de cliente la importa, **el build falla**.
- Buckets privados con URLs firmadas de vida corta. Única excepción, documentada:
  el mapa base, que es geografía pública sin un solo dato de cliente.

## Historial

Cada commit lleva un código `MAD-NNNN` que referencia su entrada en
[`CHANGELOG.md`](CHANGELOG.md), donde está el detalle de funciones y archivos.

---

© ZAIRE Technologies. Todos los derechos reservados. Código propietario.
