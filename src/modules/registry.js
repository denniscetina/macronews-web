/**
 * Maps a CMS module `type` to its component.
 * Add a module: create modules/<Name>/index.jsx and register it here.
 */
const loaders = Object.freeze({
	RichText: () => import("./RichText"),
});

/** @param {string} type */
export async function getModuleComponent(type) {
	const load = loaders[type];
	return load ? (await load()).default : null;
}
