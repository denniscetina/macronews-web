const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isValid = (entry) => isObject(entry) && ((typeof entry["@type"] === "string" && entry["@type"].trim()) || (Array.isArray(entry["@graph"]) && entry["@graph"].some(isObject)));

const originOf = (url) => {
	try {
		return new URL(url).origin;
	} catch {
		return "";
	}
};

/**
 * JSON-LD from the CMS (Yoast + MacroPress schemas). Yoast builds its URLs from the CMS domain,
 * so the CMS origin is swapped for the public site origin: structured data must describe the
 * public pages, not the admin site.
 * @param {{ schemas: any[], site: { url: string, cmsUrl: string } | null }} props
 */
export default function Schemas({ schemas, site }) {
	const cmsOrigin = originOf(site?.cmsUrl);
	const publicOrigin = originOf(site?.url);

	return schemas.filter(isValid).map((schema, index) => {
		let json = JSON.stringify(schema);
		if (cmsOrigin && publicOrigin && cmsOrigin !== publicOrigin) {
			json = json.replaceAll(cmsOrigin, publicOrigin);
		}
		// "<" cannot appear in a <script>: it could close the tag.
		const safe = json.replaceAll("<", "\\u003c").replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029");
		return <script key={`jsonld-${schema["@id"] ?? index}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: safe }} />;
	});
}
