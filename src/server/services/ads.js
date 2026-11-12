import "server-only";
import { cmsFetch } from "@/server/cms/client";
import { endpoints } from "@/server/cms/endpoints";
import { tags } from "@/server/cms/tags";

const text = (value) => (typeof value === "string" ? value.trim() : "");
const asArray = (value) => (Array.isArray(value) ? value : []);
const ids = (value) => asArray(value).map(Number).filter((id) => Number.isInteger(id) && id > 0);

/** Back-up expiry: the inventory is refreshed when the CMS saves a campaign (tag `ads:{lang}`), this only covers a missed call. */
const BACKUP_REVALIDATE = 6 * 3600;

function mapImages(raw) {
	const images = {};
	for (const [format, image] of Object.entries(raw && typeof raw === "object" ? raw : {})) {
		const url = text(image?.url);
		const width = Number(image?.width);
		const height = Number(image?.height);
		if (url && width > 0 && height > 0) {
			images[format] = { url, width, height };
		}
	}
	return images;
}

/** Campaign of `GET /ads`, with only what the browser needs to choose a piece. */
function mapCampaign(raw) {
	const sets = asArray(raw?.sets)
		.map((set) => ({ id: text(set?.id), alt: text(set?.alt), images: mapImages(set?.images) }))
		.filter((set) => set.id && Object.keys(set.images).length > 0);
	if (!Number.isInteger(raw?.id) || sets.length === 0) {
		return null;
	}
	const targeting = raw.targeting && typeof raw.targeting === "object" ? raw.targeting : {};
	return {
		id: raw.id,
		brand: raw.brand?.id ? { id: Number(raw.brand.id) } : null,
		startsAt: text(raw.startsAt) || null,
		endsAt: text(raw.endsAt) || null,
		weight: Math.max(1, Number(raw.weight) || 1),
		url: text(raw.url) || null,
		newTab: raw.newTab === true,
		targeting: { mode: targeting.mode === "only" ? "only" : "all", categories: ids(targeting.categories), locations: ids(targeting.locations) },
		sets,
	};
}

/**
 * Ad inventory of a language (`GET /ads`): every active or scheduled campaign, the same for every reader. The choice of the
 * piece is made in the browser (`lib/ads/select.js`), so this answer can be cached until a campaign changes.
 * @param {string} lang
 * @returns {Promise<{ label: string, campaigns: NonNullable<ReturnType<typeof mapCampaign>>[] } | null>}
 */
export async function getAds(lang) {
	const raw = await cmsFetch(endpoints.ads(lang), { tags: [tags.ads(lang)], revalidate: BACKUP_REVALIDATE });
	if (!raw) {
		return null;
	}
	return { label: text(raw.label), campaigns: asArray(raw.campaigns).map(mapCampaign).filter(Boolean) };
}
