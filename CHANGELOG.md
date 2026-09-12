# Historial de cambios

Cada commit lleva en el asunto un código `MAD-NNNN` que apunta a su entrada acá.
El asunto del commit dice **qué**; esta entrada dice **qué archivos, qué
funciones y por qué**.

Formato de una entrada:

```
## MAD-NNNN — asunto del commit
Fecha · Qué cambió · Archivos · Funciones · Notas
```

---

## MAD-0006 — secciones del radar con estado declarado

**Fecha:** 2026-09-12

**Qué cambió.** Las cinco sub-superficies del producto quedan navegables. Ninguna
finge tener datos: cada una declara su propósito y la lista concreta de lo que
falta para mostrar información real, con la semana del plan en la que llega. Una
feature apagada devuelve 404, no sólo esconde el link del menú — esconder un link
no es control de acceso.

**Archivos**

| Archivo | Rol |
|---|---|
| `apps/web/src/lib/routes.ts` | Catálogo único de secciones: ruta, etiqueta, feature que la gatea y estado real |
| `apps/web/src/components/shell/seccion-en-construccion.tsx` | Encabezado + "qué falta para que esta pantalla muestre algo real" |
| `apps/web/src/app/(app)/radar/page.tsx` | Feed de señales |
| `apps/web/src/app/(app)/entidades/page.tsx` | Pozos, yacimientos, proyectos y empresas |
| `apps/web/src/app/(app)/curacion/page.tsx` | Panel del operador |
| `apps/web/src/app/(app)/watchlists/page.tsx` | Seguimiento de entidades y zonas |
| `apps/web/src/app/(app)/fuentes/page.tsx` | Estado de fuentes y corridas de ingesta |
| `apps/web/src/app/(app)/loading.tsx` | Esqueleto de carga |
| `apps/web/src/app/(app)/error.tsx` | Límite de error con mensaje real y reintento |

**Funciones y símbolos:** `MAD_NAV`, `MadNavItem`, `SeccionEnConstruccion()`,
`RadarPage()`, `EntidadesPage()`, `CuracionPage()`, `WatchlistsPage()`,
`FuentesPage()`, `Loading()`, `Error()`.

**Notas.** Cada página vuelve a pedir sesión por su cuenta. El layout que las
envuelve es la primera línea, no la única: un layout no protege a sus hijas por
sí solo.

---

## MAD-0005 — identidad visual, shell de la aplicación y acceso

**Fecha:** 2026-09-12

**Qué cambió.** La aplicación deja de ser una plantilla y pasa a tener cara
propia: paleta en variables CSS, shell con barra lateral y cabecera, y acceso por
email y contraseña. La cabecera dice de qué espacio de trabajo son los datos que
se están viendo — con aislamiento por fila de por medio, eso responde a "¿esto
que veo es mío?".

**Archivos**

| Archivo | Rol |
|---|---|
| `apps/web/src/app/globals.css` | Paleta y tipografía en variables CSS, expuestas como utilidades |
| `apps/web/src/app/layout.tsx` | Raíz del documento: idioma `es-AR`, metadatos, fuentes |
| `apps/web/src/app/(auth)/login/page.tsx` | Pantalla de acceso |
| `apps/web/src/app/(auth)/login/actions.ts` | Acciones de servidor de entrada y salida |
| `apps/web/src/components/auth/login-form.tsx` | Formulario con estado de envío y error |
| `apps/web/src/components/shell/app-shell.tsx` | Barra lateral + cabecera + área de contenido |
| `apps/web/src/components/shell/sidebar-nav.tsx` | Navegación con sección activa |
| `apps/web/src/app/(app)/layout.tsx` | Envoltura de todo lo privado |
| `apps/web/src/app/(app)/page.tsx` | La raíz privada no tiene contenido propio: redirige al radar |
| `apps/web/src/app/icon.svg` | Marca de la aplicación: un barrido de radar, dibujado a mano |

**Funciones y símbolos:** `iniciarSesion()`, `cerrarSesion()`, `destinoSeguro()`,
`LoginState`, `LoginForm()`, `AppShell()`, `SidebarNav()`, `AppLayout()`,
`HomePage()`, `RootLayout()`, `LoginPage()`.

**Notas.**
- Las credenciales se validan en una acción de servidor: no pasan por el paquete
  que se descarga al navegador, y ahí sí se pueden escribir cookies.
- `destinoSeguro()` sólo acepta destinos internos. Un parámetro de redirección
  con host propio es una redirección abierta.
- El mensaje de error es genérico a propósito: no confirma si un email existe.
- Dos variables de la paleta son de producto y no de estética: el puntaje y la
  confianza no comparten color porque no significan lo mismo.
- Se quitó todo lo que venía de la plantilla de arranque: la página de
  bienvenida, sus imágenes, su archivo de instrucciones y su ícono. El ícono que
  quedó es propio: dos arcos de alcance, el haz que barre y un punto detectado
  fuera del arco interno — la señal que aparece afuera y todavía no estaba en tu
  radar.

---

## MAD-0004 — acceso a datos y frontera de sesión

**Fecha:** 2026-09-12

**Qué cambió.** Queda montada la capa que habla con la base y la que decide si
hay sesión. Son dos cosas distintas y están separadas a propósito: el borde
redirige por comodidad, la autorización real la hacen el aislamiento por fila de
la base y la verificación en el servidor.

**Archivos**

| Archivo | Rol |
|---|---|
| `apps/web/src/lib/env.ts` | Lectura de variables públicas, con error que dice qué hacer |
| `apps/web/src/lib/supabase/client.ts` | Cliente de navegador |
| `apps/web/src/lib/supabase/server.ts` | Cliente de servidor con cookies de sesión |
| `apps/web/src/lib/supabase/service.ts` | Cliente privilegiado, detrás de `server-only` |
| `apps/web/src/lib/dal.ts` | Sesión verificada y membresías |
| `apps/web/src/lib/features.ts` | Gating de sub-superficies, lado aplicación |
| `apps/web/src/proxy.ts` | Denegar por defecto en el borde + renovación del token |

**Funciones y símbolos:** `publicEnv`, `requireSupabasePublicEnv()`,
`createSupabaseBrowserClient()`, `createSupabaseServerClient()`,
`createSupabaseServiceClient()`, `getCurrentUser()`, `requireUser()`,
`getMemberships()`, `getActiveWorkspace()`, `MadRole`, `MadMembership`,
`isFeatureEnabled()`, `proxy()`, `isPublicPath()`.

**Notas.**
- Se valida el token contra el servidor de autenticación en vez de confiar en la
  cookie: la cookie la controla el cliente.
- La verificación se memoriza por render, así que diez componentes que pidan el
  usuario producen una sola llamada.
- La clave privilegiada saltea el aislamiento por fila por diseño, así que su
  módulo está marcado para servidor: si un componente de cliente lo importa, la
  compilación falla. Eso es la red de seguridad, no la buena fe.
- Las variables públicas se leen una por una y de forma literal, porque el
  reemplazo en tiempo de compilación no funciona con accesos dinámicos.
- Sin credenciales configuradas, el borde deja pasar en vez de entrar en un ciclo
  de redirecciones: el error explicado se muestra en la pantalla, que es donde se
  puede leer.

---

## MAD-0003 — núcleo de cálculo puro: gating y vocabulario de dominio

**Fecha:** 2026-09-12

**Qué cambió.** Nace el paquete de cálculo puro. No hace entrada/salida, no lee
variables de entorno y no importa la capa de interfaz, así que se prueba sin
simulacros. Arranca con dos cosas: el gating de sub-superficies y el vocabulario
del dominio.

**Archivos**

| Archivo | Rol |
|---|---|
| `packages/core/package.json` | Paquete del espacio de trabajo, compila a `dist/` |
| `packages/core/tsconfig.json`, `tsconfig.build.json` | Configuración estricta heredada de la base |
| `packages/core/eslint.config.mjs` | Reglas de estilo |
| `packages/core/src/features.ts` | Gating |
| `packages/core/src/features.test.ts` | 8 pruebas |
| `packages/core/src/domain.ts` | Vocabulario del dominio |
| `packages/core/src/index.ts` | Superficie pública del paquete |

**Funciones y símbolos:** `MAD_FEATURES`, `MadFeature`, `parseEnabledFeatures()`,
`isFeatureEnabled()`, `CLAIM_KINDS`, `SIGNAL_STATUSES`, `ACTION_TYPES`,
`SCORE_KINDS`, `CURATION_DECISIONS`, `Score`, `Confidence`.

**Notas.**
- Se escribió con las pruebas primero: las ocho fallaron antes de existir la
  implementación.
- Denegar por defecto: sin lista de features, nada está habilitado.
- Una lista mal escrita descarta el valor desconocido y sigue. Una variable de
  entorno con un typo no debe tumbar el render.
- Las listas del vocabulario son espejo de las restricciones de la base. El valor
  que no está en la restricción, la base lo rechaza.

---

## MAD-0002 — base de la aplicación web

**Fecha:** 2026-09-12

**Qué cambió.** Se levanta la aplicación web con enrutado por carpetas y
componentes de servidor, tipado estricto y hojas de estilo por utilidades. La
configuración de tipos hereda la del espacio de trabajo, para que "estricto"
signifique lo mismo en todos los paquetes.

**Archivos:** `apps/web/package.json`, `apps/web/tsconfig.json`,
`apps/web/next.config.ts`, `apps/web/postcss.config.mjs`,
`apps/web/eslint.config.mjs`.

**Notas.**
- La verificación de tipos genera primero los tipos de rutas: sin ese paso, un
  repositorio recién clonado falla porque esos tipos no existen todavía.
- Se apagó la escritura automática de archivos de notas de herramientas dentro
  del proyecto.

---

## MAD-0001 — base del monorepo y gate de calidad

**Fecha:** 2026-09-12

**Qué cambió.** Estructura del repositorio, tipado estricto compartido, gate de
calidad y plantilla de variables de entorno.

**Archivos:** `package.json`, `pnpm-workspace.yaml`, `turbo.json`,
`tsconfig.base.json`, `.gitignore`, `.env.example`, `.nvmrc`, `README.md`,
`CHANGELOG.md`.

**Notas.**
- El gate es una sola orden: verificación de tipos, estilo, compilación y
  pruebas. Nada se integra sin eso en verde.
- Sólo dos dependencias tienen permiso de ejecutar scripts durante la
  instalación. El resto no: es una defensa de cadena de suministro.
- La plantilla de entorno no lleva valores reales. La clave privilegiada está
  marcada como exclusiva del servidor.
- El material de apoyo y las notas de trabajo quedan fuera del repositorio. Acá
  vive código propio y nada más.
