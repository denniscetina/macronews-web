import { getModuleComponent } from "@/components/moduleRegistry";
import { pickTypeDictionary } from "@/lib/i18n";
import { deepMergeDict, isPlainObject } from "@/lib/i18n/translator";

const MODULE_DICTIONARY_ALIASES = Object.freeze({
	RoomsPost: "RoomPost",
});

function resolveModuleDictionaryKey(type, modulesDictionary) {
	if (!type || !isPlainObject(modulesDictionary)) {
		return "";
	}

	if (isPlainObject(modulesDictionary[type])) {
		return type;
	}

	const alias = MODULE_DICTIONARY_ALIASES[type];
	if (alias && isPlainObject(modulesDictionary[alias])) {
		return alias;
	}

	return type;
}

function resolveCmsTranslations(moduleData, dictionaryKey, type) {
	const translations = moduleData?.translations;

	if (!isPlainObject(translations)) {
		return {};
	}

	if (dictionaryKey && isPlainObject(translations[dictionaryKey])) {
		return translations[dictionaryKey];
	}

	if (type && isPlainObject(translations[type])) {
		return translations[type];
	}

	return translations;
}

export default async function ModuleRenderer({ data, site, dictionary, lang }) {
	const { sections = [] } = data?.page || {};
	const modulesDictionary = (() => {
		const modulesNode = pickTypeDictionary(dictionary, "modules");
		if (isPlainObject(modulesNode) && Object.keys(modulesNode).length > 0) {
			return modulesNode;
		}

		return pickTypeDictionary(dictionary, "module");
	})();
	const uniqueTypes = [...new Set(sections.map((module) => module?.type).filter(Boolean))];
	const resolvedComponents = await Promise.all(
		uniqueTypes.map(async (type) => ({
			type,
			Component: await getModuleComponent(type),
		})),
	);
	const componentByType = new Map(resolvedComponents.map(({ type, Component }) => [type, Component]));

	return (
		<>
			{sections.map((module, index) => {
				const { type, data } = module ?? {};
				const Component = componentByType.get(type);
				const dictionaryKey = resolveModuleDictionaryKey(type, modulesDictionary);
				const fallbackDict = isPlainObject(modulesDictionary[dictionaryKey])
					? modulesDictionary[dictionaryKey]
					: {};
				const cmsTranslations = resolveCmsTranslations(data, dictionaryKey, type);
				const effectiveDict = deepMergeDict(fallbackDict, cmsTranslations);

				if (!Component) {
					console.warn(`Unknown moduleType: ${type}`);
					return null;
				}

				return (
					<Component
						key={`${type}-${index}`}
						data={data}
						site={site}
						lang={lang}
						dict={effectiveDict}
					/>
				);
			})}
		</>
	);
}
