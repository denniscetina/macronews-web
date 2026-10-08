import { getModuleComponent } from "./registry";

/**
 * Renders the ordered list of CMS modules of a page.
 * Unknown module types are skipped (and logged) instead of breaking the page.
 * @param {{ modules: Array<{ type: string, [key: string]: any }> }} props
 */
export default async function ModuleRenderer({ modules = [] }) {
	const rendered = await Promise.all(
		modules.map(async (moduleData, index) => {
			const Component = await getModuleComponent(moduleData?.type);
			if (!Component) {
				console.warn(`[modules] unknown module type: ${moduleData?.type}`);
				return null;
			}
			return <Component key={`${moduleData.type}-${index}`} data={moduleData} />;
		}),
	);
	return <>{rendered}</>;
}
