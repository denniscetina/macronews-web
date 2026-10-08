import "server-only";
import { z } from "zod";

const emptyToUndefined = (value) => (value === "" ? undefined : value);
const optional = (schema) => z.preprocess(emptyToUndefined, schema.optional());

const schema = z.object({
	APP_ENV: z.enum(["production", "qas", "development"]).default("development"),
	SITE_URL: optional(z.url()),
	WEB_API_URL: optional(z.url()),
	WEB_API_URL_PREVIEW: optional(z.url()),
	WEB_API_HEADER_KEY: optional(z.string()),
	WEB_API_TOKEN: optional(z.string()),
	REVALIDATE_TOKEN: optional(z.string()),
	DRAFT_MODE_TOKEN: optional(z.string()),
});

let cached;

/**
 * Single place that reads process.env. Validated lazily on first use so that
 * `next build` does not fail when the CMS is not configured yet.
 * @returns {z.infer<typeof schema>}
 */
export function getEnv() {
	if (!cached) {
		const parsed = schema.safeParse(process.env);
		if (!parsed.success) {
			throw new Error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`);
		}
		cached = parsed.data;
	}
	return cached;
}

export const isProduction = () => getEnv().APP_ENV === "production";
