import { getModuleComponent } from "./registry";

/**
 * Renders the ordered list of mapped CMS modules of a page (see `mapSections`).
 * Unknown module types are skipped (and logged) instead of breaking the page.
 * @param {{ modules: Array<{ type: string, data: any }>, lang: string }} props
 */
export default async function ModuleRenderer({ modules = [], lang }) {
	const rendered = await Promise.all(
		modules.map(async (module, index) => {
			const Component = await getModuleComponent(module?.type);
			if (!Component) {
				console.warn(`[modules] unknown module type: ${module?.type}`);
				return null;
			}
			return <Component key={`${module.type}-${index}`} data={module.data} lang={lang} />;
		}),
	);
	return <>{rendered}</>;
}
