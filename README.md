# macronews-web

Frontend headless (Next.js 16, React 19, Tailwind 4, JavaScript) para el CMS WordPress de Macronews (`cms.macronews.mx`).

## Primeros pasos

```bash
cp .env.example .env.local   # completa WEB_API_* con el token generado en CMS > Site Settings > Advanced
npm install
npm run dev
```

Sin credenciales del CMS la app arranca, pero las páginas responden con error 500 (no se cachean).

## Estructura

```
src/
├─ app/                 Solo routing. Los route handlers validan y delegan.
├─ config/              env.js (único lugar que lee process.env), site.js (locales), widgets.js (clima y divisas)
├─ server/              Código exclusivo de servidor (server-only)
│  ├─ cms/              client.js (único que llama al CMS), endpoints.js, tags.js, mappers/ (site, page, sections...), mocks/ (contenido simulado)
│  ├─ services/         Casos de uso: getSite, getPage, getNearbyNews, widgets/ (clima y divisas)...
│  └─ revalidation/     Lógica de invalidación de caché
├─ features/            Una carpeta por dominio (components, hooks, api-client). Hoy: preview/, seo/
├─ modules/             Secciones del CMS: registry.js + ModuleRenderer + una carpeta por módulo (HeroCarousel, Marquee, NewsCarousel, CategoriesBlock, RichText)
├─ components/          ui/ (sin lógica de negocio), layout/
├─ i18n/                diccionarios + getDictionary + localizePath
├─ styles/  hooks/  lib/
└─ proxy.js             Routing de idiomas (el idioma por defecto no lleva prefijo)
```

## Reglas

1. Las dependencias apuntan hacia abajo: `app` -> `features`/`modules` -> `components/ui` -> `lib`. Las features no se importan entre sí.
2. Solo `server/cms/client.js` llama al CMS. Las páginas y los handlers pasan por `server/services`.
3. El navegador solo llama a los `/api/*` de esta app. Los tokens del CMS nunca llegan al cliente.
4. Los componentes nunca leen el payload crudo del CMS: los mappers en `server/cms/mappers` lo normalizan.
5. Para agregar un módulo del CMS: crea `src/modules/<Nombre>/index.jsx` y regístralo en `src/modules/registry.js`.
6. Para agregar un idioma: edita `src/config/site.js` y añade `src/i18n/dictionaries/<lang>.json` con su loader en `src/i18n/index.js`.

## Secciones de la página (módulos)

Las páginas del CMS llegan como `sections` (`{ type, data }`). `mapSections` las normaliza (descarta las que traen `enabled: false`), `ModuleRenderer` busca el componente en `modules/registry.js` y cada módulo se envuelve en `SectionFrame`, que aplica el margen, el relleno y el color de fondo que define el editor. Las especificaciones de cada componente están en el repositorio `grupo-macro1/macropress-core` (rama `dev`, `.docs/Components`).

| Sección del CMS | Módulo | Variantes |
|---|---|---|
| `HeroCarousel` | `modules/HeroCarousel` (Splide) | `default` |
| `Marquee` | `modules/Marquee` | `default`; animación horizontal, vertical o continua |
| `NewsCarousel` | `modules/NewsCarousel` | `compact`, `cards` (Splide) y `list` (con "cerca de ti") |
| `CategoriesBlock` | `modules/CategoriesBlock` | `list` |
| `ItemCollection` | `modules/ItemCollection` | `list` (Macro Secciones) |
| `SubscriptionForm` | `modules/SubscriptionForm` | `default` (El Macro Brief; el envío aún no funciona) |
| `ReelsCarousel` | `modules/ReelsCarousel` (Splide) | `default` (Macro Reels; tarjetas de escritorio diseñadas y Modo Reel en galería sin diseño) |
| `StoriesCarousel` | `modules/StoriesCarousel` (Splide) | `default` (fila de temas en círculos y Modo Historias en modal) |
| `Banner` | `modules/Banner` | `default` (hero de página de sección, Figma `Category Page > Hero`) |
| `BlogListing` | `modules/BlogListing` | `listing` (lista de notas con sidebar, Figma `Category Page > Section\AHORA CERCA DE TI`) |
| `BlogListing`, `CustomHtmlBlock` | sin implementar (se omiten y se registran en el log) | |

Cómo se prepara un módulo nuevo:
1. Crear su mapper en `server/cms/mappers/sections.js` (el componente nunca lee el payload crudo).
2. Crear `modules/<Nombre>/index.jsx` y registrarlo en `modules/registry.js`.
3. Usar `SectionFrame` y `SectionHeading` para el espaciado y el encabezado, y comparar con el Figma elemento por elemento (color, fuente, peso, tamaño, bordes, estados).

## Design tokens

Los tokens de CMS > Site Settings > Advanced se convierten en variables CSS (`lib/design-tokens.js`): `--color-<slug>`, `--space-<slug>` y `--font-<slug>` en `:root`. Los slugs que el CMS guarda con `--` (`--macro-red`) se normalizan. `styles/globals.css` declara los mismos nombres como valores por defecto, para que existan utilidades como `bg-macro-red`; un token nuevo del CMS se escribe solo en `:root` (se usa con `colorVar()` / `spacingVar()`), pero su clase de Tailwind solo existe si se declara en `@theme`.

## Widgets externos

La barra superior muestra el clima de Cancún (Open-Meteo) y el tipo de cambio USD/MXN y EUR/MXN (API SIE de Banco de México, requiere `BANXICO_TOKEN`). Se piden desde el servidor con caché corta y un tiempo máximo de 4 s; si el servicio falla, el widget se omite.

## Caché y revalidación

El HTML de cada página se genera una vez y se sirve de caché: los visitantes no hacen peticiones al CMS.

1. **Primera visita** a una URL (`x-vercel-cache: MISS`): la app pide los datos al CMS, genera el HTML y lo guarda. Las páginas públicas (`[lang]/[[...slug]]`) no se prerenderizan en el build, así que no depende de que el CMS esté disponible al desplegar.
2. **Visitas siguientes** (`HIT`): se sirve el HTML guardado, sin tocar el CMS.
3. **Update en el CMS**: el CMS llama a `/revalidate` con el token y lo que cambió. La copia vieja se descarta (`REVALIDATED`) y la siguiente visita genera la nueva.
4. **Sin cambios**: a la hora (`s-maxage=3600`, ISR) la copia caduca y una visita la regenera en segundo plano; el resto sigue recibiendo la anterior (`stale-while-revalidate`).

Las peticiones al CMS dependen entonces del número de páginas y de cada cuánto cambian, no del tráfico. Las peticiones usan los tags de `server/cms/tags.js` (`site`, `page:<slug>`, `post:<slug>`, `type:<tipo>`) y las imágenes del CMS se optimizan y guardan 30 días (`minimumCacheTTL`).
Si el CMS falla al generar una página, responde 500 y no se guarda: nunca se cachea un 404 causado por un error transitorio. El preview (draft mode) nunca usa esta caché.

El CMS invalida contenido con `GET|POST /revalidate` (reescrito a `/api/revalidate`):

- Token: header `Authorization: Bearer $REVALIDATE_TOKEN`, o `token` en el body (POST) / query (GET). Preferir POST con Bearer: un token en la URL queda en los logs. Sin token válido responde 401; sin parámetros reconocibles, 400.
- Parámetros: `target` (`layout` invalida los datos del sitio), `lang`, `slug`/`slugs`, `path`/`paths` y `tags` (arrays o separados por coma).
- Con slug o path se invalidan las dos formas de la URL (pública, sin prefijo en el idioma por defecto, e interna con prefijo). Solo `lang` invalida el inicio de ese idioma.
- Respuesta: `{ "revalidated": true, "tags": [...], "paths": [...] }`.

| Cambio en el CMS | Qué enviar |
|---|---|
| Se editó una página o nota | `lang` + `slug` |
| Cambió el menú, footer o ajustes del sitio | `target: "layout"` |
| Cambió la portada de un idioma | solo `lang` |

```bash
curl -X POST https://macronews.mx/revalidate -H "Authorization: Bearer $REVALIDATE_TOKEN" \
  -H "Content-Type: application/json" -d '{"lang":"es","slug":"about"}'
```

Cómo comprobarlo: `curl -sI <url> | grep -i x-vercel-cache` debe dar `MISS` y luego `HIT`; tras llamar a `/revalidate`, `REVALIDATED` y otra vez `HIT`.

### Menú "Publish to Website" del CMS

La barra de admin del CMS tiene el menú **🚀 Publish to Website** (código en `macropress-core`, `src/Admin/Revalidate`; el core no lo documenta). Pide el permiso de publicar y una confirmación, y llama al endpoint de revalidate configurado en Site Settings > Advanced (`https://<front>/api/revalidate`) con el token:

| Opción | Qué envía | Qué refresca en el front |
|---|---|---|
| **Site Navigation & Settings** | `target=layout` | Menús, ajustes del sitio, design tokens y rutas (tag `site`), en todas las páginas |
| **Current Page** | `slug=/<uri>` (`/` para la home) y `lang` si no es el idioma por defecto | Esa página |
| **Entire Website** | (deshabilitada: "Coming soon") | — |

Además, **guardar** una página o nota la revalida sola (`save_post`). Un aviso verde o rojo en el admin muestra el resultado.

**El token del CMS es uno solo.** El campo "Request Access Token" de Site Settings > Advanced se usa para el preview (`/api/draft`) y para el revalidate (`/api/revalidate`), así que en Vercel `DRAFT_MODE_TOKEN` y `REVALIDATE_TOKEN` deben tener el mismo valor, o el revalidate responde 401 ("Unauthorized") y la caché no se mueve. Probado en QAS el 2026-10-28: con los dos iguales, **Current Page** da `REVALIDATED` y luego `HIT`, y **Site Navigation & Settings** da `STALE` y luego `HIT`. Hay que repetirlo en el entorno de producción.

Brechas conocidas: las notas viven en `/{ubicación}/{categoría}/{slug}` pero el CMS manda `/blog/{slug}`, que no coincide; y guardar una noticia no refresca la home ni las categorías, cuyos carruseles llevan las noticias dentro de la página (quedan hasta que vence la hora de caché o se publica la home). Se resolverán con el layout de nota.

### Cloudflare (en prueba en QAS)

Estado revisado el 2026-10-30 (panel de Cloudflare, cuenta de Grupo Macro, zona `macronews.mx`, plan **Free**, solo lectura salvo lo indicado):

| Host | Registro | Proxy |
|---|---|---|
| `macronews.mx`, `www` | A 192.241.130.57 (sitio anterior, **en producción**) | Proxied. No se toca |
| `cms.macronews.mx` | A 137.184.115.76 | DNS only |
| `qas.macronews.mx` | CNAME a Vercel | **Proxied** desde el 2026-10-30 (prueba; rollback: DNS only) |

- Zona: SSL/TLS **Full**, 0 Cache Rules, Caching Level Standard, Browser Cache TTL 4 h. Rocket Loader, Early Hints, Speed Brain y Cloudflare Fonts apagados; **Email Address Obfuscation, Bot Fight Mode y Browser Integrity Check encendidos** (compartidos con producción: no se cambian sin permiso).
- El HTML no se cachea en Cloudflare (`cf-cache-status: DYNAMIC`) mientras no exista una Cache Rule. En Free se puede purgar por URL, hostname, tag (`Cache-Tag`) y prefix.
- **Probado con el proxy encendido en QAS:** "Publish to Website" > Site Navigation & Settings (aviso verde, Vercel `STALE` > `HIT` con edad 0, sin challenge de Cloudflare) y el preview desde el CMS (`/preview/<slug>`, iframe sin challenge).
- **Pendiente en QAS:** (1) apagar Email Obfuscation solo para el host `qas` con una Configuration Rule (reescribe el HTML y Bot Fight Mode inyecta `jsd/main.js`; hoy sin errores de hidratación); (2) ubicación de "cerca de ti": `cf-ipcity`, `cf-region-code` y `cf-postal-code` solo llegan con el Managed Transform "Add visitor location headers" (zona completa) o una Transform Rule limitada a `qas`; sin ellos el código cae a `x-vercel-ip-*`, que con el proxy describe el borde de Cloudflare (hoy `/api/news/nearby` responde `location: Nacional`); (3) Cache Rule del HTML (Edge TTL fijo porque Vercel manda `max-age=0, must-revalidate`; bypass de `/api/*` y de la cookie `__prerender_bypass`) y purga al publicar dentro de `/api/revalidate` (por URL al guardar una página o nota, por hostname al cambiar menús, footer o ajustes), con `CLOUDFLARE_ZONE_ID` y `CLOUDFLARE_PURGE_TOKEN` que pone el usuario; primero Vercel, luego Cloudflare.
- **Producción en DigitalOcean (destino final):** el flujo se replica con el mismo diseño. Diferencias: Next autoalojado manda `s-maxage=<revalidate>, stale-while-revalidate` (Cloudflare puede respetarlo), el caché de ISR vive en el disco de cada instancia (con varias instancias hace falta un `cacheHandler` compartido), hay que purgar el hostname completo en cada deploy y configurar `deploymentId` (sin protección contra *version skew*), un proxy inverso (Nginx o Caddy) delante, aceptar solo IPs de Cloudflare y el CMS puede llamar a `/api/revalidate` por la red interna. Afinar TTL y cabeceras en un entorno de pruebas en DigitalOcean antes de pasar `macronews.mx`.

## Preview (draft mode)

1. El botón de preview del CMS llama a `GET /api/draft?token=$DRAFT_MODE_TOKEN&slug=<slug>&lang=<lang>`.
2. Se activa draft mode y se redirige a `/preview/<lang>/<slug>`: un shell con la página real en un iframe y selector de viewport (`features/preview`).
3. En draft mode el cliente del CMS pide `preview/pages/<slug>` (o `preview/blog/<slug>`) a `WEB_API_URL_PREVIEW`, sin caché. Ese endpoint devuelve la última autosave del editor (`preview.source: "autosave"`), así que "Preview Changes" muestra los cambios sin publicar.
4. Un borrador no está en la tabla de rutas publicadas: en draft mode el último segmento se pide al CMS como slug de página. Si el slug es el de la página de inicio, el iframe carga la raíz del idioma.
5. El botón "Finish" llama a `/api/disable-draft`.

Configuración en el CMS (Site Settings > Advanced > Headless Integration):
- **Preview Request Endpoint** debe ser la URL completa con esquema y terminar en `/api/draft`, por ejemplo `https://qas.macronews.mx/api/draft`. Sin `https://` el botón "Preview Changes" del editor abre una ruta relativa dentro de `wp-admin` (404); si apunta a `/preview` no se activa el draft mode y la app redirige a `/`.
- **Request Access Token** debe coincidir con `DRAFT_MODE_TOKEN` del entorno que se previsualiza.
- El host debe ser el del despliegue que sirve la app (QAS usa `qas.macronews.mx`).

`WEB_API_URL_PREVIEW` puede quedar vacía (usa `WEB_API_URL`) o ser la raíz de la API del CMS (`https://cms.macronews.mx/wp-json/api/v1`). Un valor que no sea una URL válida rompe el build (`Invalid URL`). La cookie de draft mode caduca con cada despliegue: hay que volver a entrar desde el CMS.
Si el contenido sale en blanco entre el header y el footer, la página no tiene `sections` cargadas en el CMS (hoy solo existe el módulo `RichText`).

## Estado

El contrato de la API del CMS (`site`, `pages/:slug`, `blog`, `blog/:slug`) está confirmado contra `cms.macronews.mx`; ver `server/cms/endpoints.js`.
Los contratos de cada sección están en `.docs/Components` de `macropress-core` (rama `dev`). La implementación de referencia está en la rama `reference-headless-next-js` (solo consulta).

## Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [SemVer](https://semver.org/lang/es/). Mientras la versión sea `0.x` el proyecto no es estable: cada `minor` agrega una capa funcional y cada `patch` corrige algo sin cambiar el comportamiento esperado.

Para publicar una versión: agrega su sección aquí, sube la versión con `npm version <patch|minor|major> --no-git-tag-version` y haz commit.

### [Sin publicar]

Añadido
- Modo Historias (`modules/StoriesCarousel/Viewer.client.jsx`), primera versión sin diseño, hecha con lo que define el core y lo que explicó dev-01: al hacer clic en un círculo se abre un modal (Radix Dialog + Splide) con las historias del tema, como las de Instagram. Barras de progreso por historia, avance automático (5 s la foto, lo que dura el MP4; 15 s en YouTube/Vimeo, tiempos no definidos por el core), toque a la izquierda (tercio) para regresar y al resto para avanzar, mantener presionado pausa, flechas del teclado, botón de sonido en los videos, y "Leer noticia" enlaza a la nota. Al terminar la última historia el modal se cierra (no pasa al siguiente tema). El círculo pasó de enlace a botón.

- Módulo `Banner` (hero de las páginas de sección, p. ej. `/quintana-roo`), medido en el Figma `Category Page > Hero` (1280×418): foto con capa negra al 50 % (si el CMS no manda `overlay`), píldora de eyebrow amarilla, título Montserrat 900 56/64 −2 px, y abajo una línea al 50 % con subtítulo (amarillo), descripción y "Actualizado el …" (`updatedAt`). El core aún no documenta el Banner (dev-01 no lo ha subido): se hizo con el payload y el diseño. Pendiente: el `cta` no se pinta (el diseño no lo dibuja), las alturas distintas de `compact` y el `overlay` con valor (se aceptan número o `{color, opacity}`), la fuente Space Grotesk del "Actualizado" (hoy Inter) y el diseño móvil.

- Módulo `BlogListing` (lista de notas de las páginas de sección), medido en el Figma `Category Page > Section\AHORA CERCA DE TI` (1120 px: lista de 828 + sidebar de 244, 48 px de separación): título de sección con línea inferior, anuncio, notas de 828×158 (foto 220×158, título Montserrat 500 14/20, extracto Inter 12/18, "Leer Noticia →" y meta ubicación · "Hace N min"), un anuncio cada 4 notas y botón "Cargar más" (muestra `pagination.initial` y cada clic revela otras tantas de las que ya mandó el CMS). Sidebar en el orden del CMS: `latest` (hora + título), `most_read` (numerada), `locations` (chips) y `ad` (nuevos tamaños `rectangle` 300×250 y `skyscraper` 300×600 en `AdSlot`, dibujados en CSS porque el Figma no se puede exportar). Pendiente sin diseño o sin spec del core (dev-01 no lo ha subido): los `filters` por categoría que manda el CMS, la categoría (`kicker`) en cada nota (`showCategory`; el Figma no la dibuja), los hijos de cada ubicación, `pagination.total` (no hay endpoint para pedir más notas), el anuncio de 300×600 y su posición en el sidebar (el Figma pone el de 300×250 arriba y el de 600 en medio; el CMS manda el orden), los estados hover y el diseño móvil.

- Clima de la barra superior en la ubicación del lector: el navegador pide `/api/weather`, que usa la ciudad y las coordenadas que el borde agrega a la petición (`cf-ipcity`/`cf-iplatitude`/`cf-iplongitude` de Cloudflare o `x-vercel-ip-*` de Vercel) y consulta Open-Meteo con ellas. Sin esos datos (desarrollo local, sin proxy, transform de Cloudflare apagada) o si falla, muestra Cancún, Q. Roo como antes. El servidor deja el texto de Cancún invisible como reserva de ancho, porque la página está en caché y es igual para todos. Pendiente: en Cloudflare activar "Add visitor location headers" (Managed Transforms) en `qas`, y en la etiqueta solo sale la ciudad (sin estado).

- `NewsCarousel` en páginas de sección: el carrusel `cards` que no está en la home ahora sigue el campo `card` del CMS (`showCategory`, `showExcerpt`, `meta`) y usa la tarjeta del Figma `Category Page > Item Article` (262 px de ancho): pastilla MacroRed (78×22), título Montserrat 500 14/20 y pie con la fecha como "17 Septiembre" (Inter 300 12/16; también acepta ubicación, autor y tiempo de lectura), en un contenedor de 1120 px con 80 px de padding (32 arriba y 72 abajo). La home conserva su tarjeta del Figma (autor y tiempo de lectura) aunque el CMS le mande `meta: ['date']`: los módulos reciben `context.isHome` desde `ModuleRenderer`. Pendiente con dev-01: qué debe mostrar la tarjeta `cards` de la home, la forma de `topics` (los chips de hashtags del Figma; hoy llega vacío) y la fuente Work Sans de la pastilla (hoy Inter). El mapper ahora lee `card`.

- Plantilla clásica de nota (`features/post/ClassicPost.jsx`), el respaldo para el histórico de noticias que pidió dev-01: no usa bloques, solo el `content` del CMS tal como llega. Las URLs de nota (`/{ubicación}/{categoría}/{slug}`, de la tabla de rutas del `site`) ya no dan 404: portada 628×353 con radio 16, título Montserrat 800 24/32, línea con autor y fecha, cuerpo (Inter 400 14/22, subtítulos Inter 700 18/22, enlaces en macro-red, imágenes y videos de YouTube/Vimeo ajustados al ancho) y etiquetas. Se construyó con el Figma `Single Post` en una sola columna de 628 px sobre fondo #FAFAFA, sin los anuncios laterales ni los bloques de esa plantilla. El HTML pasa por `server/content/clean-html.js` (nueva dependencia `sanitize-html`): sin scripts, eventos ni estilos, solo iframes de YouTube/Vimeo, enlaces al sitio como rutas y externos en pestaña nueva. Pendiente: la píldora de categoría sobre el título y las etiquetas como chips sin enlace no están en el diseño (las páginas de etiqueta no existen), el autor sin cargo (el CMS no lo manda), `format: reel` (nota de Reel Mode), borradores `preview/blog`, redirección 301 de `/{slug}` a la URL canónica y la plantilla con bloques de la nota.

Corregido
- Se vuelve a pintar todo lo que el CMS manda en los menús: se había ocultado el footer de "Secciones" y "Regiones" (categorías y ubicaciones) por dar 404, pero el CMS los trae y el error es de las páginas de archivo que faltan, no de los enlaces. Hasta que existan, esos enlaces del footer y los de "Nuestra cobertura" (CategoriesBlock) dan 404.
- Megamenú de "Política": era una simulación del ejemplo del Figma que se activaba en cualquier entorno que no fuera producción (también en QAS) aunque el CMS no tiene submenú ni subcategorías. Ahora solo se simula con `SIMULATE_MEGA_MENU=true` (apagado por defecto), su "Ver todo" va al enlace del propio ítem (`/politica`) y las tarjetas de ejemplo apuntan a `/categoria/...` (el patrón real). El megamenú real sale de `mega` o de los hijos del ítem en el CMS.
- Menú del encabezado: los ítems salían solo como texto (iban a `/`) porque el CMS manda `url` sin `/` inicial (`quintana-roo`); ahora se usa el `permalink` y `url` queda de respaldo.

Próximo:
- **Pedir a dev-01 (videos de los reels, medido el 2026-11-05):** los MP4 del CMS pesan 42 a 176 MB (23 a 161 s; ~15 Mbps; uno es 4K 2160×3840) y el servidor del CMS (Caddy en el droplet, `cms.macronews.mx` en DNS only, sin CDN ni `Cache-Control` en los uploads) entrega ~1 MB/s mientras una conexión normal baja ~6.8 MB/s: el video necesita ~1.8 MB/s, por eso se traba. El archivo sí está bien armado para empezar rápido (`moov` al inicio, rangos de bytes activos). Propuesta: que el core genere una versión ligera del reel al subirlo (ffmpeg ya está en el servidor: 1080×1920, H.264, ~3–4 Mbps, `faststart`, tope de 30 a 50 MB por reel) y entregue los videos desde un CDN o almacenamiento de objetos con `Cache-Control` largo (el proxy gratuito de Cloudflare no es el lugar para servir video). **Pendiente en el front (el equipo decidió esperar la respuesta de dev-01 antes de tocarlo):** un indicador de carga cuando el video se queda esperando datos y precargar solo los metadatos del siguiente reel; no reducen el peso de los archivos.
- **Reels (core 0.11.0) y Historias (core 0.12.0), pendientes sin diseño en el Figma (decisión del equipo: lo que el core define y diseño no dibuja se hace siguiendo el core y queda anotado):** diseño de la **galería del Modo Reel** (hoy una primera versión mía: posición de controles, tamaño del reproductor y tipografía por revisar con diseño; en un teléfono el deslizar de Splide puede chocar con la barra de avance del video), `hoverPreview`, anuncios cada N reels (`adFrequency`) y el diseño **móvil** de Macro Reels (el Figma trae lista de 1 por fila en "Editorial móvil" y rejilla de 2 en "Revista nocturna móvil"; el CMS solo manda `slidesPerView.mobile`). Los reels de YouTube/Vimeo no avanzan solos al terminar (el reproductor incrustado no avisa). **Modo Historias** (hoy una primera versión sin diseño: ver "Sin publicar"; falta revisar el diseño y los anuncios cada N historias; `/historias/{slug}` ya no hace falta según dev-01), las páginas de etiqueta `/tag/{slug}` (los círculos ya no enlazan a ellas: abren el modal) y, con diseño pendiente, el estilo de la insignia "en vivo" y el círculo sin foto. Además, que `mapNewsItem` lea `format` (`standard`/`reel`).
- **Macro Reels, decisiones del equipo:** el fondo de la sección es el color que manda el CMS (`macro-black` #171717; el Figma usa #0E0E0E y se deja así a propósito) y los puntos del carrusel se dejan como los manda el CMS (el Figma no los dibuja). Pendiente con diseño: Space Grotesk en la duración y la fecha.
- **Pendiente con diseño / dev-01: variantes de botón.** El core y el CMS solo nombran `button_variant` (`default`, `primary`, `secondary`, `outline`, `link`) y el Figma (2.2 Componentes) solo tiene el botón `Primary` (#882003, hover #5A1400, Montserrat 500, tamaños 28/32/40 px). Hoy `primary` usa ese botón, `default` y `secondary` usan el botón propio de la barra (#820025) y `outline`/`link` son interpretación. Definir qué ve el editor con cada opción, o limitar el selector del CMS.
- **Pendiente con diseño (fuentes):** el Figma usa Work Sans y Public Sans en las tarjetas de `cards`, Space Grotesk en la etiqueta del panel de `CategoriesBlock` y Futura en el wordmark; el proyecto solo carga Inter y Montserrat (Montserrat sustituye a Futura) y `fontSystem` del CMS llega vacío. Hoy se usa Inter con el mismo tamaño y color. Consulta pendiente: ¿son definitivas esas fuentes? Si lo son, cargarlas en el front, registrarlas en `fontSystem` y conseguir los archivos de Futura (licencia). Tampoco hay en el CMS el color de la etiqueta por categoría (en el Figma varía): todas usan el granate.
- **Noticia de último minuto ("URGENTE")**: el Figma muestra una etiqueta "URGENTE" en la lista "Noticias cerca de ti". Se tratará como la funcionalidad de última hora: falta definir con dev-01 el campo en el CMS (hoy no existe) y su salida en `items[]`.
- **Pendiente con diseño (CategoriesBlock):** la etiqueta del panel usa Space Grotesk en el Figma (hoy Inter); la flecha junto a la categoría activa y el botón "Ver todo" salen de la spec del core y no están dibujados en el Figma (decisión: se mantienen porque la documentación del core los pide); el Figma pone una banda de anuncio de ancho completo sobre el título que el CMS no controla (el componente no tiene `show_ads`).
- **Pendiente con dev-01 (megamenú):** agregar a los ítems de `main_menu` el campo `mega` (título, enlace "ver todo", tarjetas de sección, noticia de portada) o hijos; ver el contrato propuesto en `src/server/cms/mocks/mega-menu.js`. Falta además la opción `overlay` en `Header Style` de la página (hoy solo `default`), la página de búsqueda (la lupa del header, 24 px, apunta a `/buscar` y hoy da 404; el Figma la lleva a "Búsqueda Inicial").
- **Pendientes de contenido del CMS (los hace el editor / dev-01):** menú `secondary_menu` vacío ("Nuestros ojos"), logo blanco (`logoDark`) en Brand, ícono "Alerta" en el aviso de "Noticias cerca de ti", y las noticias de prueba (sin categoría ni imagen destacada). "Lo más leído" usa el criterio `featured` porque `most_viewed` aún no existe; el Figma pide además un botón "ir a más leídos" sin campo en el CMS.
- **Publicidad:** solo placeholders (imágenes del Figma en `public/ads`); el Figma tiene además una banda de 1216×196 sobre "Nuestra cobertura" y anuncios de 320×100 entre bloques que el CMS no controla.
- **`BANXICO_TOKEN`:** falta darlo de alta en `.env.local` y en Vercel (QAS y producción) y verificar las series `SF43718` (dólar) y `SF46410` (euro).
- **Pendiente con dev-01 (categorías y archivos):** no hay subcategorías todavía (dev-01 las va a crear) y el CMS no expone `parent` en las categorías. Las URLs de archivo `/categoria/{slug}`, `/ubicacion/{...}` y `/tema/{slug}` dan 404 porque el contrato define las rutas (`/routes`, `categories[].url`) pero no de dónde salen las noticias de cada término: no hay endpoint de categorías y el listado de noticias `/blog` que registra el core (`handle_all`, solo `lang`) responde 404 en el CMS desplegado. Preguntar: cómo obtener las noticias de una categoría o subcategoría, y que exponga el padre de cada categoría y los hijos de cada ubicación. Con eso se arman los archivos con `Banner` + `BlogListing` (la plantilla del Figma `Category Page`). Nota: `%news_category%` de la URL de una noticia usa solo la subcategoría más específica, sin su padre.
- **Pendiente con dev-01 y editorial (páginas vs categorías, 2026-11-10):** (1) El menú principal lleva a **páginas** del CMS (`quintana-roo`, `seguridad`, `politica`…, todas de primer nivel: `parentId` nulo y sin hijos en el menú) y el footer a **categorías y ubicaciones** (`taxonomy`); "Política" existe como página y como categoría sin relación. Decidir si el menú usa páginas o categorías y, para el megamenú, si las secciones son hijos del ítem o subcategorías. (2) El Figma `Category Page` es el único diseño de archivo: las páginas (Banner + NewsCarousel + BlogListing) ya lo usan y las categorías, ubicaciones y etiquetas deben usar las mismas piezas armadas por el front. (3) Contenido: de las 106 noticias, 95 están en "Sin categoría", 4 en "Nota curiosa", 3 en Deportes y 1 en Clima, Espectáculos, Gobierno y Política; Seguridad, Turismo, Opinión, Medio ambiente y Cultura tienen 0 (la home también los muestra con 0 en "Nuestra cobertura"). Editorial debe clasificar las noticias antes de que los archivos sirvan. (4) Header: el contrato casi no lo documenta (solo `logoLight`/`logoDark`; las pestañas Header, Top Header y Menú móvil de Header & Footer Settings "se agregan cuando se diseñen"); `pageSettings.headerStyle` llega (`"default"`) pero el front lo lee y no lo usa (el header transparente se decide con la marca `data-header-overlay` del hero): preguntar sus valores y qué debe hacer cada uno.
- **SubscriptionForm:** ruta del servidor para el envío y reCAPTCHA cuando el CMS termine las fases II y III; hay un typo de contenido en el subtítulo de Macro Secciones ("nuestra contenido"), lo corrige el editor.
- **Pendiente con diseño (Macro Secciones):** en el Figma el sello se dibuja de ~132×132 px pegado a la derecha dentro de la caja de 371×241; el CMS manda `sello-macrotolok.png` de 242×241 (los seis ítems traen la misma imagen y un botón con URL `#`), y el front lo muestra completo (`object-contain`, ~241 px de alto). Definir si el arte debe llevar margen o si se reduce. Tampoco hay en el Figma hover del botón, hover de fila, la posición `left` ni la versión móvil (la del front es interpretación), y el título del Figma es #0A0A0C mientras el token `macro-black` del CMS es #171717 (se usa el del CMS).
- Layout de nota con bloques (la clásica ya existe) y de categoría (`/categoria/{slug}`); redirección 301 de `/{slug}` a la URL canónica.
- Módulos de página `BlogListing` y `CustomHtmlBlock`.
- Formularios (Buzón Ciudadano), reCAPTCHA y pop-ups.
- Preview de notas (`preview/blog/<slug>`): hoy los borradores se resuelven solo como páginas.
- Cloudflare en QAS: apagar Email Obfuscation solo para `qas`, resolver la ubicación de "cerca de ti" con el proxy, crear la Cache Rule del HTML y programar la purga en `/api/revalidate` (necesita `CLOUDFLARE_ZONE_ID` y `CLOUDFLARE_PURGE_TOKEN` del usuario). Después, decidir cuándo pasa `macronews.mx` al front nuevo en DigitalOcean.
- Mostrar en el shell de preview qué autosave se está viendo (`preview.sourcePost.modified`).
- Versión `1.0.0`: se publicará cuando el contrato del CMS, los layouts y el despliegue a producción estén estables.

### [0.10.0] - 2026-11-05

Añadido (core 0.11.0 Reels y 0.12.0 Historias)
- **Modo Reel** (core 0.11.0), sin diseño en el Figma (sigue el core y la decisión del equipo): al hacer clic en una tarjeta de Macro Reels se abre una **galería a pantalla completa** con fondo negro y el video; **no hay página por reel** y la dirección no cambia. El modal es el **Dialog de shadcn/ui** (sobre Radix: foco atrapado, Esc, bloqueo de scroll; `components/ui/Dialog.jsx`, en JavaScript y sin `shadcn init` para no pisar los design tokens; única dependencia nueva: `@radix-ui/react-dialog`) y el paso entre reels es **Splide** (flechas, deslizar, teclado ← →). Reproduce el reel activo (MP4 propio con los controles del navegador; YouTube y Vimeo con su reproductor incrustado, siempre en silencio) y pausa los demás; respeta `settings.reels` (`autoplay`, `startMuted` con respaldo a silencio si el navegador bloquea el sonido, `onEnd` siguiente o repetir, `continueWithLatest`). Muestra categoría, título, fecha ("Hoy" o relativa), caption y el botón "Leer la nota" cuando hay nota relacionada. Al llegar a los últimos reels pide más a `/api/reels` (ruta de Next.js que valida los filtros del `feed`, agrega la API key y, con `nearby`, la ubicación del lector; `private, no-store`) con `exclude` y `cursor`. `settings.reels` entra al modelo del sitio (`mapSite`).
- Módulo `StoriesCarousel` (fila de círculos de Macro Historias), solo escritorio, medido en el Figma `Section\Interest topics` de la Home superior (debajo del Marquee): línea superior de 1 px #E5E5E5, encabezado con el subtítulo (Montserrat 500 12/20, mayúsculas, #171717) sobre una línea #E5E5E5, 32 px de separación y la fila; el Figma dibuja un título oculto ("TEMAS Y PERSONAJES", Montserrat 900 20/32 -1 px) y sin título (el CMS lo manda vacío) se conservan sus 32 + 4 px para que el subtítulo quede donde el diseño lo pone. Círculo de 96 px de ancho: aro de 84 px con 2 px (sin ver #7F0000, visto #D4D4D4, patrocinado #FFEE04 aunque ya se haya visto), 2.5 px de blanco y foto de 75 px; sin foto, iniciales sobre el color del tema (color de la paleta, `customColor` o el principal; no está diseñado). Insignia sobre la esquina inferior derecha (Inter 700 9/13.5, radio completo; "nuevo" rojo, "popular" amarillo; "en vivo" lo define el core pero **no está dibujado en el Figma** (se buscó en todas las capas): se pinta con el rojo y su estilo queda pendiente con diseño) y el nombre debajo (Inter 700 12/16, mayúsculas, centrado). Carrusel Splide con 32 px entre círculos; las flechas solo aparecen si los temas no caben en la fila (clase `is-overflow`). El visto/no visto vive en `localStorage` (`macronews:stories:seen`, ids de historias, las últimas 500, como pide el core): **al hacer clic en un círculo el tema pasa a visto y su aro se pone gris al instante** (decisión del equipo; el patrocinado sigue amarillo), y se mantiene al recargar; si el navegador bloquea el almacenamiento, el aro se pone gris durante esa visita. Cuando exista el Modo Historias, cada tema empezará en la primera historia sin ver. El fondo de la sección es el que manda el CMS (`macro-white` #F8F8F7; el Figma usa #FFFFFF). Las historias de cada tema se mapean pero aún no se envían al navegador (el modal no existe).

### [0.9.0] - 2026-11-05

Añadido (2026-11-04, core 0.11.0 Reels)
- Módulo `ReelsCarousel` ("Macro Reels"), solo escritorio, medido en el Figma `Section\Macro reels` de la Home superior: línea de 1 px #171717, relleno 96/32, contenedor de hasta 1280 px con 48 px entre encabezado y tarjetas; encabezado con título Montserrat 900 48/48 -2.4 px, subtítulo Inter 600 14/20 +1.4 px #A3A3A3 (en fondo oscuro), línea inferior #262626 y el anuncio a media columna (608×75 en el Figma, `showAds`). Tarjeta de reel 9:16 (286×508 en el Figma), radio 16, #171717 y dos sombras suaves, póster vertical bajo un degradado negro (`from-black via-black/30 to-transparent`), 16 px de relleno: píldora de categoría (Inter 700 9/13.5, negro al 75 % con desenfoque de 4 px), píldora de duración roja #C5111A (radio 4), botón de play amarillo de 40 px, título Inter 700 14/20 y fecha 10/15 #A3A3A3 ("Hoy" si se publicó el mismo día en hora de Cancún, regla confirmada por el equipo; si no, "Hace N …"). Carrusel Splide con `slidesPerView.desktop` (4) y 24 px entre tarjetas; flechas y puntos según el CMS. Sin reels, la sección se oculta (el core no usa respaldo). `mapReelItem` normaliza el reel (`video` con proveedor `upload`, YouTube o Vimeo).
- `SectionHeading`: el subtítulo usa #A3A3A3 sobre fondo oscuro.

Documentado (2026-10-30)
- Cloudflare: estado de la zona `macronews.mx`, prueba con el proxy encendido solo en `qas` (preview y "Publish to Website" funcionan), pendientes de Email Obfuscation y de la ubicación de "cerca de ti", plan de caché del HTML con purga en `/api/revalidate` y diferencias para el despliegue final en DigitalOcean. Ver "Cloudflare (en prueba en QAS)".

### [0.8.0] - 2026-10-29

Añadido
- Footer desde el CMS (core 0.10.0, MacroPress > Header y Footer): descripción, títulos de columna, copyright con el año, imagen de fondo (escritorio y móvil) con un degradado negro al 90 % encima, como el Figma (la spec del core pedía mostrarla sin overlay: gana el diseño) y color; tres menús planos (`footer_menu` = Secciones, `footer_secondary_menu` = Regiones, `footer_legal_menu` = legales), dirección, correo y redes con ícono según su `key`. Medidas del Figma: línea superior de 1 px #171717, relleno 64/48, cuatro columnas de 268 px con 48 px entre ellas, línea y fila inferior.
- `Logo`: si el logo del CMS ya trae el wordmark (633×96), se muestra solo, con 64 px de alto sobre el hero, 40 con scroll y 36 en el footer (422×64 en el diseño); si es solo el ícono, se mantiene el ícono + texto.
- `SectionHeading` con antetítulo (`heading.eyebrow`, core 0.10.0): píldora del Figma `Category_Pill` (radio 4, relleno 6/12, 12 px en negrita, +2 px, mayúsculas; Space Grotesk en el Figma, hoy Inter porque no está cargada). Variante `split` (Macro Secciones): el subtítulo va a la derecha, alineado abajo con el título, Inter 500 12/18, +2 px, #820025, a la derecha.
- Módulo `ItemCollection` (Macro Secciones, variante `list`), medido en el Figma: sección con línea superior de 1 px #E5E5E5 y 32 px de relleno, contenedor de hasta 1280 px con 64 px a los lados, encabezado con 64 px arriba y 48 abajo. Filas con línea inferior de 1 px #E5E5E5 (dentro de la fila, no suma altura): número Montserrat 14/28 (500 #171717 al 33 %; 600 en acento el activo), título Montserrat 800 24 -2 px, descripción Inter 14/20 #555552 (14/22 y 703 px máx. en el activo), relleno 32/48/32/16, 12 px entre elementos; el activo mide 220 px. Botón del activo: Montserrat 500 14/24, radio 8, relleno 4/8, flecha de 12 px, color de acento. Imagen de 371×180 al 75 % (alto pedido por el equipo; el Figma dibuja la caja de 371×241), centrada en la fila, a la derecha (o izquierda según `imagePosition`; en móvil debajo del texto). Al cargar el activo es el que marca el CMS con `isActive` (hoy Macro Toolok; sin ninguno marcado, ninguno); después el que elija el lector (clic/Enter). Respeta `prefers-reduced-motion`. Verificado: alturas 125/220/125 como el Figma. Debajo de la lista va el `Placeholder Ad` del Figma (1216×196, imagen ajustada y centrada, 32 px bajo la lista); el CMS no tiene campo de anuncios en este módulo, así que se muestra siempre y es placeholder hasta que exista el sistema de anuncios. El Figma trae otro igual encima del encabezado que aún no se agrega.
- Módulo `SubscriptionForm` (El Macro Brief), medido en el Figma: banda blanca con 48 px arriba, 80 abajo y 24 a los lados; tarjeta #171717 (el CMS manda `macro-black`) de radio 24 y relleno 72; columna de 672 px con 12 px entre piezas. Píldora amarilla de radio completo (Inter 600 10/14, +1.1 px, texto #171717), título Montserrat 700 40/48 -1.2 px en mayúsculas, descripción Inter 16/24 #E2E2E4. Formulario: campo de 56 px, radio 12, blanco al 10 % **sin borde**, placeholder Inter 14 +1 px al 33 %; botón de 56 px, radio 12, #C5111A, Montserrat 600 18/24 con flecha de 12 px (en este componente el botón es el rojo del Figma, no el `Primary` del sistema, así que `buttonVariant` no se aplica). Elementos de confianza Inter 12/16 con ícono rojo de 12 px, 24 px entre ellos. La imagen del CMS (432×369) va pegada a la esquina inferior derecha de la tarjeta al 85 %: en el Figma el arte es una caja de 522×392 que se sale 87 px a la derecha y 23 abajo y el archivo del CMS es justo la parte visible. El degradado de fondo es una capa `Overlay+Blur` del Figma: círculo de 345 px #7F0000 al 20 % con desenfoque (CSS `blur(20px)`, el 40 de Figma), 91 px fuera por la derecha y 100 por abajo, detrás de la imagen. **El envío aún no funciona**: valida el formato y trae el honeypot `website`, pero falta la ruta del servidor que llame a `POST {form.endpoint}` con la API key y `X-MacroPress-Client-IP` (el CMS tiene hoy solo la fase I; `form.endpoint` y `form.list` llegan `null`). Sin dibujar en el Figma: hover/foco del campo y del botón, mensajes de error/éxito y móvil (interpretación).

Cambiado y corregido (2026-10-29)
- `NewsCarousel` variante `list` ("Noticias cerca de ti"), corregido contra el Figma `Section\AHORA CERCA DE TI`: línea de 1 px #E5E5E5 arriba y abajo (el fondo #FAFAFA ya lo manda el CMS), relleno 64 px arriba, 128 abajo y 32 a los lados, contenedor de hasta 1280 px, 48 px entre el título y las dos columnas y 48 px entre columnas (5/7 de 12). Las variantes `compact` y `cards` no cambian.
- Imagen móvil (`image.mobile`): `ItemCollection` (imagen de cada ítem) y `SubscriptionForm` (imagen de fondo) usan la versión `mobile` por debajo de 768 px y la `desktop` desde ahí, cada una con la otra como respaldo si el CMS manda solo una. Hoy el CMS manda el mismo archivo en las dos.
- **Footer (auditado contra la Home del Figma el 2026-10-29):** columnas, tipografías, colores, espacios, íconos y fila inferior coinciden (la altura la da el contenido, como el Figma: 64 px arriba y 48 abajo; no tiene altura mínima). La imagen de fondo lleva encima el degradado negro al 90 % del Figma (`Lineal Gradiente #000000 / #000000, 90 %`); el core dice mostrarla sin overlay, aquí gana el diseño. **Pendiente con diseño / dev-01:** el logo del Figma es el ícono de 40×40 más el texto MACRONEWS en Futura 26 (217 px en total) y el CMS manda el logo completo, que el front muestra a 237×36; el Figma dice "Aviso de Privacidad" / "Términos de Servicio" y una lista de regiones más larga: lo que se ve en el front es lo que cargó el editor en los menús.

### [0.7.0] - 2026-10-28

Añadido
- Capa de secciones: `mapSections` (mapper de `sections` del CMS), `SectionFrame` (margen, relleno y color de fondo con los design tokens) y los módulos `HeroCarousel` (Splide) y `Marquee`.
- CSS desde los design tokens del CMS (`colorSystem`, `spacingSystem`, `fontSystem`): `--color-<slug>`, `--space-<slug>`, `--font-<slug>` en `:root` y valores por defecto en `globals.css`.
- Módulo `NewsCarousel` con sus tres variantes (`compact`, `cards`, `list`), `SectionHeading` y espacio publicitario (imagen placeholder del Figma en `public/ads`, 728×90 y 320×100; no hay sistema de anuncios todavía). `compact` y `cards` usan Splide; `list` pide las noticias de la ubicación del lector a `/api/news/nearby`, que reenvía al CMS la ubicación (cabeceras `cf-*` de Cloudflare o `x-vercel-ip-*` de Vercel) y responde `private, no-store`, así la página sigue en caché.
- Módulo `CategoriesBlock` (variante `list`): categorías en grande a la izquierda y panel con las noticias de la elegida a la derecha (Splide, una noticia a la vez); la categoría sigue al cursor, al foco o al primer toque, y el siguiente clic abre su archivo (`/category/<slug>/`, el layout de categoría aún no existe).
- Header con dos estados (Figma Header Overlay/Sticky): transparente de 105 px sobre el hero al inicio de la página y rojo de 79 px al hacer scroll (`HeaderShell` pone `data-scrolled`; el CSS está en `.site-header*`). Solo es transparente en páginas cuyo primer bloque marca `data-header-overlay` (el hero); en las demás nace rojo y `main` deja espacio debajo. Megamenú de escritorio (`MegaMenu`): se abre con clic en un ítem del menú que traiga `mega`, se cierra con Escape, clic fuera o al cambiar de página.
- **Megamenú, de dónde sale** (en este orden): (1) el campo `mega` que mande el CMS en el ítem (tarjetas, "ver todo" y noticia de portada; contrato propuesto en `src/server/cms/mocks/mega-menu.js`); (2) el submenú normal de WordPress: cada hijo es una tarjeta (con su "Descripción" si la tiene) y el ítem padre, si tiene enlace real, es el "Ver todo"; sin noticia de portada; (3) **solo fuera de producción**, el ejemplo del Figma simulado para "Política". Hoy el CMS no manda ni hijos ni `mega`, así que se ve el ejemplo simulado en QAS y local. Al agregar los submenús en el CMS, el megamenú se activa solo (los textos "Secciones de…" y "Ver todo en…" salen del diccionario).
- Documentado el menú "Publish to Website" del CMS y su relación con `/revalidate`.
- Header de escritorio con lupa de búsqueda (24 px) y hamburguesa (32 px) a la derecha del menú, como el Figma; la hamburguesa abre el mismo menú desplegable que usa el móvil.
- Top bar: clima de Cancún (Open-Meteo, caché de 15 min) y tipo de cambio USD/MXN y EUR/MXN (API SIE de Banco de México, caché de 1 h, requiere `BANXICO_TOKEN`). Si un servicio falla o no hay token, el widget se omite.

Cambiado
- El CSS se construye desde los design tokens del CMS; el espaciado usa `--space-<slug>` (no `--spacing-*`, porque Tailwind también lo lee para `max-w-md`, `max-w-3xl`...).
- `cmsFetch` acepta cabeceras extra y `noStore`; el texto de las secciones se decodifica de entidades HTML en el mapper.
- Todo lo clicable muestra el cursor de mano (regla global; Tailwind 4 lo deja por defecto en los botones).
- Header de 79 px y barra superior #000 con línea #1C1C1C como el Figma; el hero lleva 160 px de relleno superior.

Corregido
- El botón "Ver noticia" del hero y el de la barra de anuncios no aparecían cuando el CMS los mandaba con URL `#`.
- Los ítems de la lista "cerca de ti" saltaban al cambiar de activo; ahora llevan el mismo relleno y el extracto como en el diseño.
- Los títulos con entidades HTML (`&#8220;`) se veían literales.
- El megamenú de ejemplo ya no se muestra en producción.
- La lista "Noticias cerca de ti" parpadeaba al pasar el cursor por el hueco entre noticias: el ítem activo cambiaba de alto y de bordes. Ahora todos los ítems tienen la misma caja en los dos estados (solo cambian los colores), el extracto se muestra también en el activo y el borde activo es rojo oscuro desde el primer instante (antes salía negro durante la transición).
- El revalidate del CMS respondía 401: el CMS usa un solo token para preview y revalidate (documentado arriba).

### [0.6.0] - 2026-10-20

Añadido
- Las páginas públicas se generan en la primera visita y se sirven de caché (`generateStaticParams` vacío en `[lang]/[[...slug]]`): `MISS`, luego `HIT`, y `REVALIDATED` tras `/revalidate`. Los visitantes ya no provocan peticiones al CMS.
- README: flujo completo de revalidate (cuándo se genera, cuándo caduca, qué enviar según el cambio) y notas para activar Cloudflare.

Cambiado
- Un fallo del CMS al generar una página responde 500 y no se cachea; antes se convertía en un 404 que habría quedado guardado una hora.
- Sin credenciales del CMS las páginas responden 500 en lugar de 404.

### [0.5.1] - 2026-10-20

Corregido
- Preview: los borradores y la página de inicio ya cargan en el iframe (antes daban 404 porque no están en la tabla de rutas publicadas).
- Preview: el iframe de la página de inicio apunta a la raíz del idioma y no a `/<slug>`.
- Se quitó el parámetro `previewFrame`, que no usaba nadie.
- README: configuración del preview en el CMS (endpoint con `https://` y `/api/draft`, `WEB_API_URL_PREVIEW`).

### [0.5.0] - 2026-10-13

Añadido
- `robots.txt`: solo producción es indexable; bloquea `/api` y `/preview`.
- `sitemap.xml` con páginas, notas y categorías de cada idioma activo (`lastmod`, refresco cada hora). Vacío fuera de producción.
- `getSiteUrl()`: origen público desde `SITE_URL`, con respaldo en el dominio principal del CMS.
- El cliente del CMS envía `User-Agent: MacronewsWeb/1.0` para poder identificarlo en el firewall del CMS.

Corregido
- Los canonicals ya no llevan la barra final que manda el CMS (Next redirige esas URLs).

### [0.4.0] - 2026-10-12

Añadido
- `features/seo`: `buildMetadata` (title, description, canonical, Open Graph, Twitter, robots) y `ContentFrame`, reutilizable por páginas, notas y categorías.
- JSON-LD del CMS, con el origen del CMS sustituido por el público.
- Scripts del CMS: los `<meta>` de `head` pasan a metadatos, el resto se inyecta; `bodyStart` y `bodyEnd` se renderizan en el HTML.
- `og:locale` tomado de Polylang (`es_MX`) y `noindex` automático fuera de producción.
- Decodificación de entidades HTML en los textos de SEO.

### [0.3.0] - 2026-10-12

Añadido
- Shell global según el diseño de Figma: top bar, header sticky con menú de escritorio y drawer móvil, y footer.
- Tokens de marca (colores, fuentes) con sobrescritura desde el CMS (`colorSystem`, `fontSystem`).
- Fuentes Inter y Montserrat (Montserrat sustituye a Futura mientras no estén los archivos).
- Todo el shell se alimenta del payload `site`; los bloques sin datos no se dibujan.

### [0.2.0] - 2026-10-12

Añadido
- Capa de datos contra la API MacroPress: mappers de `site`, páginas (`sections` como módulos), notas, medios, SEO y enlaces.
- Servicios `getPost`, `getPosts` (filtro por categoría y paginación hechos en Next, porque `/blog` solo respeta `lang`) y `resolveRoute`.

Cambiado
- `WEB_API_URL` puede apuntar a la raíz de la API o a `/site`.
- Las peticiones envían `lang`; el preview usa los endpoints `/preview/...`.
- Solo el idioma `es` está activo; el routing, los servicios y los tags siguen siendo por idioma.

### [0.1.0] - 2026-10-08

Añadido
- Estructura por capas: `app`, `server/cms`, `server/services`, `features`, `modules`, `components`.
- Cliente único del CMS, revalidación (`/revalidate` -> `/api/revalidate`) y preview con draft mode.
- Routing de idiomas y bloqueo de rutas maliciosas en `proxy.js`.
- `ModuleRenderer` con registro de módulos, `/api/health` y configuración validada de entorno.
