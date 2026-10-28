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
├─ config/              env.js (único lugar que lee process.env), site.js (locales)
├─ server/              Código exclusivo de servidor (server-only)
│  ├─ cms/              client.js (único que llama al CMS), endpoints.js, tags.js, mappers/
│  ├─ services/         Casos de uso: getSite, getPage...
│  └─ revalidation/     Lógica de invalidación de caché
├─ features/            Una carpeta por dominio (components, hooks, api-client). Hoy: preview/, seo/
├─ modules/             Bloques del CMS: registry.js + ModuleRenderer + una carpeta por módulo
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

### Cloudflare (pendiente)

Hoy `qas.macronews.mx` apunta a Vercel con el registro en "DNS only": la caché la hace Vercel y `/revalidate` basta. Si en producción se activa el proxy de Cloudflare (nube naranja), Cloudflare guardará su propia copia y `/revalidate` tendrá que purgarla con su API (`CLOUDFLARE_ZONE_ID` y un token con permiso de purga), además de una regla de caché que salte las peticiones con la cookie de draft mode. Vercel entrega `max-age=0, must-revalidate` hacia fuera, así que Cloudflare necesitará su propio TTL en la regla.

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
La implementación de referencia está en la rama `reference-headless-next-js` (solo consulta).

## Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [SemVer](https://semver.org/lang/es/). Mientras la versión sea `0.x` el proyecto no es estable: cada `minor` agrega una capa funcional y cada `patch` corrige algo sin cambiar el comportamiento esperado.

Para publicar una versión: agrega su sección aquí, sube la versión con `npm version <patch|minor|major> --no-git-tag-version` y haz commit.

### [Sin publicar]

Añadido
- Capa de secciones: `mapSections` (mapper de `sections` del CMS), `SectionFrame` (margen, relleno y color de fondo con los design tokens) y los módulos `HeroCarousel` (Splide) y `Marquee`.
- CSS desde los design tokens del CMS (`colorSystem`, `spacingSystem`, `fontSystem`): `--color-<slug>`, `--space-<slug>`, `--font-<slug>` en `:root` y valores por defecto en `globals.css`.
- Módulo `NewsCarousel` con sus tres variantes (`compact`, `cards`, `list`), `SectionHeading` y espacio publicitario (imagen placeholder del Figma en `public/ads`, 728×90 y 320×100; no hay sistema de anuncios todavía). `compact` y `cards` usan Splide; `list` pide las noticias de la ubicación del lector a `/api/news/nearby`, que reenvía al CMS la ubicación (cabeceras `cf-*` de Cloudflare o `x-vercel-ip-*` de Vercel) y responde `private, no-store`, así la página sigue en caché.
- Módulo `CategoriesBlock` (variante `list`): categorías en grande a la izquierda y panel con las noticias de la elegida a la derecha (Splide, una noticia a la vez); la categoría sigue al cursor, al foco o al primer toque, y el siguiente clic abre su archivo (`/category/<slug>/`, el layout de categoría aún no existe).
- Header con dos estados (Figma Header Overlay/Sticky): transparente de 105 px sobre el hero al inicio de la página y rojo de 79 px al hacer scroll (`HeaderShell` pone `data-scrolled`; el CSS está en `.site-header*`). Solo es transparente en páginas cuyo primer bloque marca `data-header-overlay` (el hero); en las demás nace rojo y `main` deja espacio debajo. Megamenú de escritorio (`MegaMenu`): se abre con clic en un ítem del menú que traiga `mega`, se cierra con Escape, clic fuera o al cambiar de página.
- **Megamenú, de dónde sale** (en este orden): (1) el campo `mega` que mande el CMS en el ítem (tarjetas, "ver todo" y noticia de portada; contrato propuesto en `src/server/cms/mocks/mega-menu.js`); (2) el submenú normal de WordPress: cada hijo es una tarjeta (con su "Descripción" si la tiene) y el ítem padre, si tiene enlace real, es el "Ver todo"; sin noticia de portada; (3) **solo fuera de producción**, el ejemplo del Figma simulado para "Política". Hoy el CMS no manda ni hijos ni `mega`, así que se ve el ejemplo simulado en QAS y local. Al agregar los submenús en el CMS, el megamenú se activa solo (los textos "Secciones de…" y "Ver todo en…" salen del diccionario).
- Header de escritorio con lupa de búsqueda (24 px) y hamburguesa (32 px) a la derecha del menú, como el Figma; la hamburguesa abre el mismo menú desplegable que usa el móvil.
- Top bar: clima de Cancún (Open-Meteo, caché de 15 min) y tipo de cambio USD/MXN y EUR/MXN (API SIE de Banco de México, caché de 1 h, requiere `BANXICO_TOKEN`). Si un servicio falla o no hay token, el widget se omite.

Próximo:
- **Pendiente con diseño / dev-01: variantes de botón.** El core y el CMS solo nombran `button_variant` (`default`, `primary`, `secondary`, `outline`, `link`) y el Figma (2.2 Componentes) solo tiene el botón `Primary` (#882003, hover #5A1400, Montserrat 500, tamaños 28/32/40 px). Hoy `primary` usa ese botón, `default` y `secondary` usan el botón propio de la barra (#820025) y `outline`/`link` son interpretación. Definir qué ve el editor con cada opción, o limitar el selector del CMS.
- **Pendiente con diseño (fuentes):** el Figma usa Work Sans y Public Sans en las tarjetas de `cards`, Space Grotesk en la etiqueta del panel de `CategoriesBlock` y Futura en el wordmark; el proyecto solo carga Inter y Montserrat (Montserrat sustituye a Futura) y `fontSystem` del CMS llega vacío. Hoy se usa Inter con el mismo tamaño y color. Consulta pendiente: ¿son definitivas esas fuentes? Si lo son, cargarlas en el front, registrarlas en `fontSystem` y conseguir los archivos de Futura (licencia). Tampoco hay en el CMS el color de la etiqueta por categoría (en el Figma varía): todas usan el granate.
- **Noticia de último minuto ("URGENTE")**: el Figma muestra una etiqueta "URGENTE" en la lista "Noticias cerca de ti". Se tratará como la funcionalidad de última hora: falta definir con dev-01 el campo en el CMS (hoy no existe) y su salida en `items[]`.
- **Pendiente con diseño (CategoriesBlock):** la etiqueta del panel usa Space Grotesk en el Figma (hoy Inter); la flecha junto a la categoría activa y el botón "Ver todo" salen de la spec del core y no están dibujados en el Figma (decisión: se mantienen porque la documentación del core los pide); el Figma pone una banda de anuncio de ancho completo sobre el título que el CMS no controla (el componente no tiene `show_ads`).
- **Pendiente con dev-01 (megamenú):** agregar a los ítems de `main_menu` el campo `mega` (título, enlace "ver todo", tarjetas de sección, noticia de portada) o hijos; ver el contrato propuesto en `src/server/cms/mocks/mega-menu.js`. Falta además la opción `overlay` en `Header Style` de la página (hoy solo `default`), la página de búsqueda (la lupa del header, 24 px, apunta a `/buscar` y hoy da 404; el Figma la lleva a "Búsqueda Inicial").
- Layouts de nota (`/{slug}`) y de categoría (`/category/{slug}`).
- Módulos de página `BlogListing` y `CustomHtmlBlock`.
- Formularios (Buzón Ciudadano), reCAPTCHA y pop-ups.
- Preview de notas (`preview/blog/<slug>`): hoy los borradores se resuelven solo como páginas.
- Purgado de la caché de Cloudflare desde `/revalidate`, si el dominio de producción usa el proxy.
- Mostrar en el shell de preview qué autosave se está viendo (`preview.sourcePost.modified`).
- Versión `1.0.0`: se publicará cuando el contrato del CMS, los layouts y el despliegue a producción estén estables.

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
