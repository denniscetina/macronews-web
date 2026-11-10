/**
 * SIMULATED mega menu content (the CMS does not send it yet), only with `SIMULATE_MEGA_MENU=true` outside production.
 * The card links are examples (the subcategories do not exist yet). Remove this file when dev-01 adds the fields.
 *
 * Proposed CMS contract, per `main_menu` item (same key as the menu item, `mega`):
 * {
 *   "mega": {
 *     "title": "Secciones de política",
 *     "viewAll": { "label": "Ver todo en política", "url": "/categoria/politica/" },
 *     "sections": [
 *       { "title": "Gobierno", "description": "Poder ejecutivo estatal…", "url": "/…", "highlighted": false, "badge": "" }
 *     ],
 *     "featured": { "kicker": "Legislativo", "title": "…", "excerpt": "…", "image": { id, url, alt }, "url": "/…", "publishedAt": "ISO 8601", "ctaLabel": "Leer análisis" }
 *   }
 * }
 * `sections` also work as the item's `children` (mobile menu); `highlighted` paints the wide red-bordered card
 * ("Elecciones" in Figma) and `badge` is its two-line tag ("Proceso 2026"). `featured` may be omitted.
 * Menu items without `mega` and without `children` stay plain links.
 */
const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60_000).toISOString();

/** Keyed by the menu item label in lower case, no accents (only the one that exists in the Figma design). */
export const MEGA_MENU_MOCK = {
	politica: {
		simulated: true,
		title: "Secciones de política",
		viewAll: { label: "Ver todo en política", url: "/categoria/politica/" },
		sections: [
			{ title: "Gobierno", description: "Poder ejecutivo estatal, Gabinete y dependencias públicas.", url: "/categoria/gobierno/" },
			{ title: "Congreso", description: "Leyes, Reformas Constitucionales y Comisiones Legislativas", url: "/categoria/congreso/" },
			{ title: "Municipios", description: "Benito Juárez, Solidaridad, Othón P. Blanco y Cabildos", url: "/categoria/municipios/" },
			{ title: "Partidos", description: "Comités Directivos, Alianzas y Debate Partidista", url: "/categoria/partidos/" },
			{ title: "Elecciones", description: "Cobertura de aspirantes, precampañas y monitoreo del IEQROO", url: "/categoria/elecciones/", highlighted: true, badge: "Proceso 2026" },
		],
		featured: {
			kicker: "Legislativo",
			title: "Alianzas estratégicas perfilan votación unánime en el Congreso",
			excerpt: "Fracciones Parlamentarias acuerdan redistribución de comisiones y la agenda de la siguiente sesión.",
			image: null,
			url: "/categoria/congreso/",
			publishedAt: minutesAgo(35),
			ctaLabel: "Leer análisis",
		},
	},
};
