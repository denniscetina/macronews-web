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
├─ features/            Una carpeta por dominio (components, hooks, api-client). Hoy: preview/
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

## Estado

El contrato de la API del CMS (`site`, `pages/:slug`) se asumió a partir del proyecto de referencia y debe confirmarse.
La implementación de referencia está en la rama `reference-headless-next-js`.
