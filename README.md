# macronews-web

Frontend headless (Next.js 16, React 19, Tailwind 4, JavaScript) para el CMS WordPress de Macronews (`cms.macronews.mx`).

## Primeros pasos

```bash
cp .env.example .env.local   # completa WEB_API_* con el token generado en CMS > Site Settings > Advanced
npm install
npm run dev
```

Sin credenciales del CMS la app arranca, pero las páginas responden 404.

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

Las peticiones al CMS usan ISR (`revalidate: 3600`) con los tags de `server/cms/tags.js`.
El CMS invalida contenido con `GET|POST /revalidate` (reescrito a `/api/revalidate`):

- Token: header `Authorization: Bearer $REVALIDATE_TOKEN`, o `token` en el body (POST) / query (GET). Preferir POST con Bearer: un token en la URL queda en los logs.
- Parámetros: `target` (`layout` invalida los datos del sitio), `lang`, `slug`/`slugs`, `path`/`paths` y `tags` (arrays o separados por coma).
- Con slug o path se invalidan las dos formas de la URL (pública, sin prefijo en el idioma por defecto, e interna con prefijo). Solo `lang` invalida el inicio de ese idioma.

```bash
curl -X POST https://macronews.mx/revalidate -H "Authorization: Bearer $REVALIDATE_TOKEN" \
  -H "Content-Type: application/json" -d '{"lang":"es","slug":"about"}'
```

## Preview (draft mode)

1. El botón de preview del CMS llama a `GET /api/draft?token=$DRAFT_MODE_TOKEN&slug=<slug>&lang=<lang>`.
2. Se activa draft mode y se redirige a `/preview/<lang>/<slug>`: un shell con la página real en un iframe y selector de viewport (`features/preview`).
3. En draft mode el cliente del CMS usa `WEB_API_URL_PREVIEW` y no cachea.
4. El botón "Finish" llama a `/api/disable-draft`.

Configuración en el CMS (Site Settings > Advanced > Headless Integration):
- **Preview Request Endpoint** debe terminar en `/api/draft`, por ejemplo `qas.macronews.mx/api/draft`. Si apunta a `/preview` no se activa el draft mode y la app redirige a `/`.
- **Request Access Token** debe coincidir con `DRAFT_MODE_TOKEN` del entorno que se previsualiza.
- El host debe ser el del despliegue que sirve la app (QAS usa `qas.macronews.mx`).

Si el shell abre pero el iframe muestra 404, revisa `WEB_API_URL_PREVIEW`: en draft mode el cliente pide `preview/pages/<slug>` a ese host (o a `WEB_API_URL` si no está definida).

## Estado

El contrato de la API del CMS (`site`, `pages/:slug`, `blog`, `blog/:slug`) está confirmado contra `cms.macronews.mx`; ver `server/cms/endpoints.js`.
La implementación de referencia está en la rama `reference-headless-next-js` (solo consulta).

## Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [SemVer](https://semver.org/lang/es/). Mientras la versión sea `0.x` el proyecto no es estable: cada `minor` agrega una capa funcional y cada `patch` corrige algo sin cambiar el comportamiento esperado.

Para publicar una versión: agrega su sección aquí, sube la versión con `npm version <patch|minor|major> --no-git-tag-version` y haz commit.

### [Sin publicar]

Próximo:
- Layouts de nota (`/{slug}`) y de categoría (`/category/{slug}`).
- Módulos de página `BlogListing` y `CustomHtmlBlock`.
- Formularios (Buzón Ciudadano), reCAPTCHA y pop-ups.
- Preview: iframe de la home y borradores resueltos por slug y tipo. Hoy el iframe responde 404 en draft mode (home y borradores); `resolveRoute` solo conoce las rutas publicadas del payload `site`.

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
