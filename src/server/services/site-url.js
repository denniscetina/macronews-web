import "server-only";
import { getEnv } from "@/config/env";
import { getSite } from "@/server/services/site";

/**
 * Public origin of this frontend, without trailing slash. `SITE_URL` wins; otherwise the
 * primary domain configured in the CMS. Returns "" when neither is available.
 */
export async function getSiteUrl() {
	const value = getEnv().SITE_URL || (await getSite())?.url || "";
	try {
		return new URL(value).origin;
	} catch {
		return "";
	}
}
