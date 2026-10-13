import { isProduction } from "@/config/env";
import { getSiteUrl } from "@/server/services/site-url";

/** Only production is indexable: QAS and local must never appear in search engines. */
export default async function robots() {
	if (!isProduction()) {
		return { rules: { userAgent: "*", disallow: "/" } };
	}
	const base = await getSiteUrl();
	return {
		rules: { userAgent: "*", allow: "/", disallow: ["/api", "/preview"] },
		...(base ? { sitemap: `${base}/sitemap.xml` } : {}),
	};
}
