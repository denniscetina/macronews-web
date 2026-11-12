/**
 * Choice of the ad piece of one space (core `.docs/Features/Ads/index.md`, "Reglas de selección"). One function shared by
 * every component: the CMS says what each space looks for (`ads`), the inventory (`GET /ads`) says what exists, and the
 * browser decides, so rotation and dates are real and not frozen in a cached page.
 *
 * @typedef {{ url: string, width: number, height: number }} AdImage
 * @typedef {{ id: number, brand: { id: number } | null, startsAt: string | null, endsAt: string | null, weight: number, url: string | null, newTab: boolean,
 *   targeting: { mode: "all" | "only", categories: number[], locations: number[] }, sets: { id: string, alt: string, images: Record<string, AdImage> }[] }} Campaign
 * @typedef {{ placement: string, formats: { desktop: string[], mobile: string[] }, mode: "random" | "campaign" | "manual", campaignId: number | null,
 *   targeting: { categories: number[], locations: number[] } | null,
 *   manual: { id: string, alt: string, images: Record<string, AdImage>, href: string | null, external: boolean, newTab: boolean } | null }} AdSpace
 * @typedef {{ key: string, campaignId: number | null, brandKey: string | null, format: string, image: AdImage, alt: string, href: string | null, newTab: boolean }} AdPiece
 */

/** Brand of a campaign for the "no repeats" rule: internal campaigns (no brand) count as one brand. */
const brandKeyOf = (campaign) => (campaign.brand ? `b${campaign.brand.id}` : "internal");

/** Active now: `startsAt` <= now < `endsAt`, `null` meaning no limit (the browser clock decides). */
function isCurrent(campaign, now) {
	const starts = campaign.startsAt ? Date.parse(campaign.startsAt) : Number.NEGATIVE_INFINITY;
	const ends = campaign.endsAt ? Date.parse(campaign.endsAt) : Number.POSITIVE_INFINITY;
	return starts <= now && now < ends;
}

/** Space filter: without it only "whole site" campaigns; with it, "only in..." campaigns that share an id in every dimension either side declares. */
function matchesSpace(campaign, filter) {
	if (!filter) {
		return campaign.targeting.mode === "all";
	}
	if (campaign.targeting.mode !== "only") {
		return false;
	}
	return ["categories", "locations"].every((dimension) => {
		const wanted = filter[dimension];
		const declared = campaign.targeting[dimension];
		if (wanted.length === 0 && declared.length === 0) {
			return true;
		}
		return wanted.length > 0 && declared.length > 0 && wanted.some((id) => declared.includes(id));
	});
}

/** Weighted draw (`weight`: 1 low, 2 normal, 4 high in the CMS). */
function drawByWeight(items, random) {
	const total = items.reduce((sum, item) => sum + item.weight, 0);
	let point = random() * total;
	for (const item of items) {
		point -= item.weight;
		if (point < 0) {
			return item;
		}
	}
	return items[items.length - 1];
}

const pieceOf = (campaign, set, format) => ({
	key: set.id,
	campaignId: campaign.id,
	brandKey: brandKeyOf(campaign),
	format,
	image: set.images[format],
	alt: set.alt,
	href: campaign.url,
	newTab: campaign.newTab,
});

/** First format of the list for which the campaign has a set; the piece is one of its sets with that format, at random. */
function pieceFromCampaign(campaign, formats, random) {
	for (const format of formats) {
		const sets = campaign.sets.filter((set) => set.images[format]);
		if (sets.length > 0) {
			return pieceOf(campaign, sets[Math.floor(random() * sets.length)], format);
		}
	}
	return null;
}

/**
 * @param {{ space: AdSpace, screen: "desktop" | "mobile", campaigns: Campaign[], now?: number, used?: { campaigns: Set<number>, brands: Set<string> }, random?: () => number }} input
 *   `used`: campaigns and brands already on this view (not repeated while other candidates remain)
 * @returns {AdPiece | null} `null` collapses the space
 */
export function selectAd({ space, screen, campaigns, now = Date.now(), used = { campaigns: new Set(), brands: new Set() }, random = Math.random }) {
	const formats = space.formats[screen] ?? [];
	if (formats.length === 0) {
		return null;
	}

	if (space.mode === "manual") {
		const manual = space.manual;
		const format = manual ? formats.find((name) => manual.images[name]) : null;
		return manual && format
			? { key: manual.id, campaignId: null, brandKey: null, format, image: manual.images[format], alt: manual.alt, href: manual.href, newTab: manual.newTab }
			: null;
	}

	if (space.mode === "campaign" && space.campaignId) {
		const chosen = campaigns.find((campaign) => campaign.id === space.campaignId && isCurrent(campaign, now));
		const piece = chosen ? pieceFromCampaign(chosen, formats, random) : null;
		if (piece) {
			return piece;
		}
		// Not in the inventory, not current or without the format: it falls back to random.
	}

	const eligible = campaigns.filter((campaign) => isCurrent(campaign, now) && matchesSpace(campaign, space.targeting));
	for (const format of formats) {
		const withFormat = eligible.filter((campaign) => campaign.sets.some((set) => set.images[format]));
		if (withFormat.length === 0) {
			continue;
		}
		const fresh = withFormat.filter((campaign) => !used.campaigns.has(campaign.id) && !used.brands.has(brandKeyOf(campaign)));
		const campaign = drawByWeight(fresh.length > 0 ? fresh : withFormat, random);
		return pieceFromCampaign(campaign, [format], random);
	}
	return null;
}
