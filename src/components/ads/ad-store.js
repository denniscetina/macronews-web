import { selectAd } from "@/lib/ads/select";

/**
 * Browser-side registry of the ad spaces on the page (client only). It does what the core asks of the frontend:
 * one request for the inventory per language and page load, shared by every space, and one choice per space that
 * does not repeat a campaign or a brand on the same view while there are other candidates.
 * Spaces register when they mount and release when they unmount (a page change or a "load more" starts clean).
 */

/** @typedef {{ piece: import("@/lib/ads/select").AdPiece, label: string }} AdView */

const listeners = new Set();
/** @type {Map<string, { space: import("@/lib/ads/select").AdSpace, screen: "desktop" | "mobile", lang: string, resolved: boolean, view: AdView | null }>} */
const slots = new Map();
/** @type {Map<string, { ready: boolean, label: string, campaigns: any[] }>} */
const inventories = new Map();

const notify = () => listeners.forEach((listener) => listener());

function loadInventory(lang) {
	if (inventories.has(lang)) {
		return;
	}
	const entry = { ready: false, label: "", campaigns: [] };
	inventories.set(lang, entry);
	const done = (data) => {
		entry.ready = true;
		entry.label = typeof data?.label === "string" ? data.label : "";
		entry.campaigns = Array.isArray(data?.campaigns) ? data.campaigns : [];
		resolvePending();
	};
	fetch(`/api/ads?lang=${encodeURIComponent(lang)}`)
		.then((response) => (response.ok ? response.json() : null))
		.then(done, () => done(null));
}

/** Campaigns and brands already shown by the other spaces of this view. */
function usedBy(exceptId) {
	const used = { campaigns: new Set(), brands: new Set() };
	for (const [id, slot] of slots) {
		const piece = slot.view?.piece;
		if (id !== exceptId && piece) {
			if (piece.campaignId !== null) {
				used.campaigns.add(piece.campaignId);
			}
			if (piece.brandKey) {
				used.brands.add(piece.brandKey);
			}
		}
	}
	return used;
}

function resolveSlot(id) {
	const slot = slots.get(id);
	if (!slot || slot.resolved) {
		return;
	}
	const inventory = inventories.get(slot.lang);
	if (slot.space.mode !== "manual" && !inventory?.ready) {
		return;
	}
	const piece = selectAd({ space: slot.space, screen: slot.screen, campaigns: inventory?.campaigns ?? [], used: usedBy(id) });
	slot.resolved = true;
	slot.view = piece ? { piece, label: inventory?.label ?? "" } : null;
}

function resolvePending() {
	for (const id of slots.keys()) {
		resolveSlot(id);
	}
	notify();
}

/**
 * @param {string} id
 * @param {import("@/lib/ads/select").AdSpace} space
 * @param {"desktop" | "mobile"} screen
 * @param {string} lang
 * @returns {() => void} release
 */
export function mountSlot(id, space, screen, lang) {
	slots.set(id, { space, screen, lang, resolved: false, view: null });
	if (space.mode !== "manual") {
		loadInventory(lang);
	}
	resolveSlot(id);
	notify();
	return () => {
		slots.delete(id);
		notify();
	};
}

export const subscribe = (listener) => {
	listeners.add(listener);
	return () => listeners.delete(listener);
};

/** @returns {AdView | null} Stable between notifications, as `useSyncExternalStore` needs. */
export const getView = (id) => slots.get(id)?.view ?? null;
