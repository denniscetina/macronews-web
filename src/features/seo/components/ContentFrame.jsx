import CodeInjection from "./CodeInjection";
import HeadCodeInjection from "./HeadCodeInjection.client";
import Schemas from "./Schemas";
import { resolveBodyInjection, resolveHeadInjection } from "../code-injection";

/**
 * Wraps the content of any CMS resource (page, post, category) with what its payload carries
 * besides the content: JSON-LD schemas and the site scripts for head / body start / body end.
 * @param {{ seo: ReturnType<typeof import("@/server/cms/mappers/seo").mapSeo>, scripts: ReturnType<typeof import("@/server/cms/mappers/seo").mapScripts>, site: any, children: React.ReactNode }} props
 */
export default function ContentFrame({ seo, scripts, site, children }) {
	return (
		<>
			<HeadCodeInjection scripts={resolveHeadInjection(scripts.head).clientScripts} />
			<CodeInjection position="bodyStart" scripts={resolveBodyInjection(scripts.bodyStart)} />
			<Schemas schemas={seo.schemas} site={site} />
			{children}
			<CodeInjection position="bodyEnd" scripts={resolveBodyInjection(scripts.bodyEnd)} />
		</>
	);
}
