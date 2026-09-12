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

## MAD-0012 — motor de mapas en su línea estable y arranque a prueba de entornos

**Fecha:** 2026-09-12

**Qué cambió.** El mapa quedaba en "cargando" para siempre. Tres causas
encadenadas, y la última era propia.

**1. La versión 6 del motor no sirve acá.** Se distribuye sólo como módulos ES y
con el trabajador en segundo plano en un archivo aparte; en la versión 5 venía
embebido. El empaquetador no resuelve bien esa referencia, y sin trabajador el
estilo nunca termina de resolverse: ni carga, ni falla. Se baja a la línea 5, que
es la que sostiene el ecosistema.

**2. El grafo de módulos quedaba viejo.** Cambiar paquetes con el servidor de
desarrollo levantado deja el módulo sin resolver hasta reiniciarlo.

**3. El filtro de errores propio tapaba la causa.** Se decidía qué mostrar según
el texto del mensaje. Ahora el criterio es **si el mapa ya cargó**: antes de
cargar, cualquier error se muestra; después, un mosaico suelto que falló no
justifica tapar la pantalla.

**Archivos:** `apps/web/src/components/map/territory-map.tsx`,
`apps/web/package.json`.

**Notas.**
- Las capas se montan cuando el estilo está resuelto, escuchando tanto la carga
  completa como el cambio de estilo. Esperar sólo a la carga completa es frágil:
  ese evento aguarda al primer cuadro dibujado, y en una máquina sin aceleración
  por hardware puede demorar muchísimo o no llegar.
- Hay plazo máximo. Un indicador de carga sin límite no es un estado: es una
  pantalla rota que no se anima a admitirlo.
- Si el aviso de demora alcanzó a aparecer y después el mapa carga, el aviso se
  retira.
- Verificado en un navegador real: lienzo, controles, atribución, estilo y todos
  sus recursos derivados responden. La confirmación del último evento de carga
  necesita aceleración por hardware, que el entorno de prueba no tiene.

## MAD-0011 — el mapa base ahora dibuja, y el cajón se pliega

**Fecha:** 2026-09-12

**Qué cambió.** El mapa se veía completamente negro, con la atribución del
proveedor visible al pie. Esa combinación —atribución sí, territorio no— era la
pista: el motor arrancaba y el estilo cargaba, pero nadie montaba el lienzo.

**La causa.** La versión 6 del motor de mapas eliminó su exportación por
defecto. El envoltorio de React que se estaba usando todavía la esperaba, recibía
`undefined` y fallaba en silencio. Se eliminó el envoltorio y se maneja el motor
directo con importaciones con nombre: una pieza menos que puede desincronizarse
con la versión del motor, y control explícito del ciclo de vida.

Además, el cajón inferior de listados ahora se pliega para dejarle todo el alto
al territorio.

**Archivos:** `apps/web/src/components/map/territory-map.tsx`,
`apps/web/src/components/map/command-view.tsx`,
`apps/web/src/app/globals.css`, `apps/web/package.json`.

**Notas.**
- El lienzo se posiciona con desplazamiento cero sobre un contenedor relativo, no
  con alto porcentual. Un alto en porcentaje depende de que cada ancestro tenga
  altura definida, y basta un eslabón suelto para que quede en cero y la pantalla
  se vea negra sin decir por qué.
- Los estilos del motor se importan en la hoja principal y no dentro del
  componente, para que no dependan de cómo se divida el paquete.
- Los fallos del motor se muestran en pantalla con su mensaje. Un mapa que no
  carga tiene que explicarse; ese fue justamente el problema que costó una tarde.
- El mapa se crea una sola vez. Los datos entran actualizando la fuente, no
  recreando el mapa.

## MAD-0010 — mapa vectorial real, marquesina en vivo y diagnóstico visible

**Fecha:** 2026-09-12

**Qué cambió.** Tres cosas que hacían que la pantalla de mando no se pudiera usar.

**1. El mapa es un mapa.** Motor vectorial con calles, costas, topónimos,
desplazamiento y acercamiento. Los nodos se dibujan con capas nativas del motor,
no con marcadores de HTML, para que miles de puntos no maten el desplazamiento.
El estilo del mapa base sale de una variable de entorno: hoy apunta a un servicio
de mosaicos libre derivado de datos abiertos, sin clave, y el día que exista el
mosaico propio se cambia la variable sin tocar el componente.

**2. Marquesina inferior.** Contexto permanente en la base de la pantalla: hora
universal, estado, clima con viento en los tres polos industriales que seguimos, y
sismos recientes del Cono Sur. Datos reales de fuentes públicas sin clave,
consultados desde el servidor y cacheados — el navegador del usuario no habla con
nadie más que con nosotros.

**3. Los fallos se muestran.** La pantalla decía "no hay entidades
geolocalizadas" cuando el problema real era que faltaba aplicar un archivo de
esquema. Ahora cada lectura que falla vuelve como diagnóstico con el motivo y la
acción concreta, en un panel sobre el mapa que se puede cerrar.

**Archivos**

| Archivo | Rol |
|---|---|
| `apps/web/src/components/map/territory-map.tsx` | Mapa vectorial con capas nativas |
| `apps/web/src/lib/vivo.ts` | Clima y sismos desde fuentes públicas |
| `apps/web/src/components/shell/marquesina.tsx` | Marquesina inferior |
| `apps/web/src/components/map/panel-diagnostico.tsx` | Qué falta y qué hacer |
| `apps/web/src/lib/radar.ts` | Lectura con diagnóstico en vez de silencio |
| `apps/web/src/app/(auth)/layout.tsx` | Presentación a la izquierda, formulario a la derecha |

**Funciones y símbolos:** `getEstadoRadar()`, `EstadoRadar`, `Diagnostico`,
`esObjetoInexistente()`, `getDatosVivos()`, `ItemVivo`, `Marquesina()`,
`PanelDiagnostico()`.

**Notas.**
- Devolver una lista vacía y una frase genérica manda a buscar el problema al
  lugar equivocado: parece que faltan datos cuando falta aplicar un archivo. El
  silencio es el peor diagnóstico.
- Si una fuente externa no responde, su tramo desaparece de la marquesina y el
  resto sigue. Una marquesina que se cae entera porque un servicio ajeno tosió es
  peor que una a la que le falta un dato.
- El reloj arranca vacío y se llena en el navegador: la hora del servidor y la
  del cliente difieren, y renderizar dos valores distintos rompe la hidratación.
- El viento se marca en tono de atención a partir de 40 km/h. No es clima de
  fondo: es el umbral que frena izaje y trabajo en altura.
- Los nombres de las entidades aparecen recién al acercarse. A escala país serían
  ilegibles.

---

## MAD-0009 — pantalla de mando: riel de capas y territorio

**Fecha:** 2026-09-12

**Qué cambió.** La primera pantalla deja de ser una lista y pasa a ser un puesto
de mando: riel de capas a la izquierda, territorio en el centro, cajón de
listados abajo. Cada ícono del riel prende o apaga una capa del mapa y muestra
cuántos elementos tiene, que es el dato que hace útil la decisión de encenderla.

La navegación entre secciones se mudó a la barra superior. Dos rieles verticales
peleando por el mismo borde confunden qué hace cada uno.

**Archivos**

| Archivo | Rol |
|---|---|
| `apps/web/src/lib/capas.ts` | Definición de capas: qué tipos agrupa cada una, color, radio |
| `apps/web/src/lib/radar.ts` | Lecturas de entidades geolocalizadas y señales |
| `apps/web/src/components/map/command-view.tsx` | Estado compartido entre riel, territorio y cajón |
| `apps/web/src/components/map/layer-rail.tsx` | Riel de capas con conteo por capa |
| `apps/web/src/components/map/territory-map.tsx` | Lienzo territorial |
| `apps/web/src/components/senales/score-confianza.tsx` | Puntaje y confianza, representados distinto |
| `apps/web/src/components/shell/app-shell.tsx` | Chasis: barra superior + área de trabajo completa |
| `apps/web/src/components/shell/top-nav.tsx` | Navegación entre sub-superficies |
| `apps/web/src/app/(app)/radar/page.tsx` | Pantalla de mando |
| `apps/web/src/app/(app)/loading.tsx`, `error.tsx` | Estados de carga y de fallo |

**Funciones y símbolos:** `CAPAS`, `CAPAS_POR_DEFECTO`, `capaDeTipo()`,
`PuntoEntidad`, `SenalResumen`, `getPuntosEntidades()`, `getSenales()`,
`CommandView()`, `LayerRail()`, `TerritoryMap()`, `proyectarY()`,
`ScoreConfianza()`, `AppShell()`, `TopNav()`, `ListaSenales()`,
`ListaEntidades()`.

**Notas.**
- El territorio usa proyección Mercator esférica sobre SVG, con el encuadre
  calculado a partir de los propios puntos. Sin biblioteca de mapas: mientras no
  exista el mosaico vectorial propio, dibujar calles y etiquetas de un proveedor
  ajeno sería ruido geográfico y una dependencia que no queremos. El componente
  ya trabaja en coordenadas geográficas, así que migrar es un cambio interno.
- El puntaje se dibuja como barra continua porque es una magnitud; la confianza,
  como cinco muescas, porque es una estimación gruesa y fingir precisión decimal
  sería mentir sobre lo que sabemos.
- El halo sólo aparece en lo que tiene señal o está seleccionado. Es el único
  brillo de la interfaz.
- Un punto sembrado para demostración lo dice en su panel. Nunca se presenta
  como hecho de fuente.
- La lista vacía explica las dos causas posibles, y una de ellas es que el
  aislamiento por fila esté filtrando bien.

---

## MAD-0008 — pantalla de acceso, alta de cuenta y recuperación

**Fecha:** 2026-09-12

**Qué cambió.** El acceso pasa a ser una pantalla partida 40/60: formulario a la
izquierda, presentación del producto a la derecha, con tres láminas navegables.
Se suman alta de cuenta y recuperación de contraseña, y un pie con el aviso de
derechos.

**Archivos**

| Archivo | Rol |
|---|---|
| `apps/web/src/app/(auth)/layout.tsx` | Partición 40/60, marca y pie |
| `apps/web/src/app/(auth)/actions.ts` | Entrar, crear cuenta, recuperar, salir |
| `apps/web/src/lib/auth-state.ts` | Estado que devuelven esas acciones |
| `apps/web/src/app/(auth)/login/page.tsx` | Entrar |
| `apps/web/src/app/(auth)/registro/page.tsx` | Crear cuenta |
| `apps/web/src/app/(auth)/recuperar/page.tsx` | Recuperar acceso |
| `apps/web/src/components/auth/auth-carousel.tsx` | Tres láminas con indicadores navegables |
| `apps/web/src/components/auth/territory-backdrop.tsx` | Territorio abstracto en SVG |
| `apps/web/src/components/auth/campos.tsx` | Campos, botón y mensajes |
| `apps/web/src/components/auth/login-form.tsx`, `signup-form.tsx`, `recovery-form.tsx` | Formularios |

**Funciones y símbolos:** `AuthLayout()`, `iniciarSesion()`, `crearCuenta()`,
`recuperarAcceso()`, `cerrarSesion()`, `destinoSeguro()`, `AuthState`,
`ESTADO_AUTH_INICIAL`, `AuthCarousel()`, `TerritoryBackdrop()`, `Campo()`,
`CampoPassword()`, `BotonEnviar()`, `Mensaje()`.

**Notas.**
- El fondo del panel no es una imagen de archivo: es la misma gramática que usa
  el producto —grilla técnica, trazas finas, nodos con densidad—, así que la
  pantalla de acceso ya dice qué es esto antes de entrar. Dibujado a mano y
  determinístico, sin pedidos a la red.
- En pantallas angostas el panel de presentación se oculta entero en vez de
  apilarse: un carrusel arriba del formulario empuja el campo de email fuera de
  la vista.
- El carrusel se detiene apenas el puntero o el foco entran. Nadie quiere que el
  texto salte mientras lo está leyendo.
- Los indicadores llevan número y etiqueta en vez de ser puntos mudos.
- El error de credenciales es genérico a propósito: no confirma si un email
  existe. La única excepción es la cuenta sin confirmar, porque ahí el usuario no
  puede hacer nada solo y necesita saber a quién pedirle el alta.
- La recuperación responde siempre lo mismo, haya o no cuenta con ese email: la
  diferencia sería una forma de averiguar quién está registrado.
- El alta entra directo si el proyecto no exige confirmación; si la exige, lo
  dice en vez de dejar al usuario en una pantalla que no explica nada.
- El estado de las acciones vive en su propio módulo porque un archivo de
  acciones de servidor sólo puede exportar funciones async.

---

## MAD-0007 — sistema visual: paleta fría y modo oscuro permanente

**Fecha:** 2026-09-12

**Qué cambió.** La interfaz adopta su identidad definitiva: estación de trabajo
de inteligencia territorial. Oscuro permanente, familia cromática fría, líneas
finas, radios bajos y densidad alta.

**Archivos:** `apps/web/src/app/globals.css`, `apps/web/src/app/layout.tsx`,
`apps/web/src/app/icon.svg`.

**Símbolos:** variables `--mad-*`, clases `.mad-panel`, `.mad-panel-active`,
`.mad-grid`, `.mad-brackets`, `.mad-label`, `.mad-dot`, `.mad-halo`,
`.mad-depth`.

**Notas.**
- Queda prohibido en toda la aplicación: naranja, ámbar, amarillo cálido,
  violeta, degradados arcoíris o neón, cristal esmerilado, sombras pesadas y
  esquinas muy redondeadas.
- El verde se reserva para lo verificado, activo, confirmado o positivo. Y el
  color nunca comunica solo: siempre hay texto o forma acompañando.
- Los degradados sólo se usan cuando cumplen una función: profundidad de oscuro a
  oscuro, o iluminación fría de una región seleccionada.
- Cifras tabulares en toda la aplicación. Una columna de números que baila al
  actualizarse es ruido, y acá los números son el contenido.
- Tipografía sans técnica humanista, sin identidad monoespaciada.

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
