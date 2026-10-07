import "server-only";
/*
 * Recorre un objeto o array y reemplaza las URLs del CMS por la ruta del proxy local.
 * @param {any} data - Los datos recibidos del CMS (puede ser un objeto, array, string, etc.).
 * @returns {any} - Los datos con las URLs reemplazadas.
 */
export function rewriteCmsUrls(data) {
	const CMS_MULTIMEDIA_DOMAIN = process.env.CMS_MULTIMEDIA_DOMAIN;
	const CMS_MEDIA_DOMAIN = process.env.CMS_MEDIA_DOMAIN;
	const CMS_PROXY_MEDIA_DOMAIN = process.env.CMS_PROXY_MEDIA_DOMAIN;

	// Convertimos todo a string para hacer un reemplazo global
	const jsonString = JSON.stringify(data);

	// Usamos una expresión regular para reemplazar todas las ocurrencias
	const rewrittenString = jsonString
		.replace(new RegExp(CMS_MEDIA_DOMAIN, 'g'), CMS_PROXY_MEDIA_DOMAIN)
		.replace(new RegExp(CMS_MULTIMEDIA_DOMAIN, 'g'), CMS_PROXY_MEDIA_DOMAIN);
	// Convertimos de nuevo a objeto/array
	return JSON.parse(rewrittenString);
}