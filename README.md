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

Documentado (2026-10-30)
- Cloudflare: estado de la zona `macronews.mx`, prueba con el proxy encendido solo en `qas` (preview y "Publish to Website" funcionan), pendientes de Email Obfuscation y de la ubicación de "cerca de ti", plan de caché del HTML con purga en `/api/revalidate` y diferencias para el despliegue final en DigitalOcean. Ver "Cloudflare (en prueba en QAS)".

Próximo:
- **Pendiente con diseño / dev-01: variantes de botón.** El core y el CMS solo nombran `button_variant` (`default`, `primary`, `secondary`, `outline`, `link`) y el Figma (2.2 Componentes) solo tiene el botón `Primary` (#882003, hover #5A1400, Montserrat 500, tamaños 28/32/40 px). Hoy `primary` usa ese botón, `default` y `secondary` usan el botón propio de la barra (#820025) y `outline`/`link` son interpretación. Definir qué ve el editor con cada opción, o limitar el selector del CMS.
- **Pendiente con diseño (fuentes):** el Figma usa Work Sans y Public Sans en las tarjetas de `cards`, Space Grotesk en la etiqueta del panel de `CategoriesBlock` y Futura en el wordmark; el proyecto solo carga Inter y Montserrat (Montserrat sustituye a Futura) y `fontSystem` del CMS llega vacío. Hoy se usa Inter con el mismo tamaño y color. Consulta pendiente: ¿son definitivas esas fuentes? Si lo son, cargarlas en el front, registrarlas en `fontSystem` y conseguir los archivos de Futura (licencia). Tampoco hay en el CMS el color de la etiqueta por categoría (en el Figma varía): todas usan el granate.
- **Noticia de último minuto ("URGENTE")**: el Figma muestra una etiqueta "URGENTE" en la lista "Noticias cerca de ti". Se tratará como la funcionalidad de última hora: falta definir con dev-01 el campo en el CMS (hoy no existe) y su salida en `items[]`.
- **Pendiente con diseño (CategoriesBlock):** la etiqueta del panel usa Space Grotesk en el Figma (hoy Inter); la flecha junto a la categoría activa y el botón "Ver todo" salen de la spec del core y no están dibujados en el Figma (decisión: se mantienen porque la documentación del core los pide); el Figma pone una banda de anuncio de ancho completo sobre el título que el CMS no controla (el componente no tiene `show_ads`).
- **Pendiente con dev-01 (megamenú):** agregar a los ítems de `main_menu` el campo `mega` (título, enlace "ver todo", tarjetas de sección, noticia de portada) o hijos; ver el contrato propuesto en `src/server/cms/mocks/mega-menu.js`. Falta además la opción `overlay` en `Header Style` de la página (hoy solo `default`), la página de búsqueda (la lupa del header, 24 px, apunta a `/buscar` y hoy da 404; el Figma la lleva a "Búsqueda Inicial").
- **Pendientes de contenido del CMS (los hace el editor / dev-01):** menú `secondary_menu` vacío ("Nuestros ojos"), logo blanco (`logoDark`) en Brand, ícono "Alerta" en el aviso de "Noticias cerca de ti", y las noticias de prueba (sin categoría ni imagen destacada). "Lo más leído" usa el criterio `featured` porque `most_viewed` aún no existe; el Figma pide además un botón "ir a más leídos" sin campo en el CMS.
- **Publicidad:** solo placeholders (imágenes del Figma en `public/ads`); el Figma tiene además una banda de 1216×196 sobre "Nuestra cobertura" y anuncios de 320×100 entre bloques que el CMS no controla.
- **`BANXICO_TOKEN`:** falta darlo de alta en `.env.local` y en Vercel (QAS y producción) y verificar las series `SF43718` (dólar) y `SF46410` (euro).
- **SubscriptionForm:** ruta del servidor para el envío y reCAPTCHA cuando el CMS termine las fases II y III; hay un typo de contenido en el subtítulo de Macro Secciones ("nuestra contenido"), lo corrige el editor.
- **Pendiente con diseño (Macro Secciones):** en el Figma el sello se dibuja de ~132×132 px pegado a la derecha dentro de la caja de 371×241; el CMS manda `sello-macrotolok.png` de 242×241 (los seis ítems traen la misma imagen y un botón con URL `#`), y el front lo muestra completo (`object-contain`, ~241 px de alto). Definir si el arte debe llevar margen o si se reduce. Tampoco hay en el Figma hover del botón, hover de fila, la posición `left` ni la versión móvil (la del front es interpretación), y el título del Figma es #0A0A0C mientras el token `macro-black` del CMS es #171717 (se usa el del CMS).
- Layouts de nota (`/{slug}`, con redirección 301 a la URL canónica) y de categoría (`/category/{slug}`).
- Módulos de página `BlogListing` y `CustomHtmlBlock`.
- Formularios (Buzón Ciudadano), reCAPTCHA y pop-ups.
- Preview de notas (`preview/blog/<slug>`): hoy los borradores se resuelven solo como páginas.
- Cloudflare en QAS: apagar Email Obfuscation solo para `qas`, resolver la ubicación de "cerca de ti" con el proxy, crear la Cache Rule del HTML y programar la purga en `/api/revalidate` (necesita `CLOUDFLARE_ZONE_ID` y `CLOUDFLARE_PURGE_TOKEN` del usuario). Después, decidir cuándo pasa `macronews.mx` al front nuevo en DigitalOcean.
- Mostrar en el shell de preview qué autosave se está viendo (`preview.sourcePost.modified`).
- Versión `1.0.0`: se publicará cuando el contrato del CMS, los layouts y el despliegue a producción estén estables.

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
