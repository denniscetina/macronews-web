import { useEffect, useMemo, useState } from "react";

const normalizePath = (value) => {
	const rawPath = String(value || "").trim();

	if (!rawPath) {
		return "/";
	}

	const withLeadingSlash = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
	const normalized = withLeadingSlash.replace(/\/+/g, "/");

	if (normalized.length > 1 && normalized.endsWith("/")) {
		return normalized.slice(0, -1).toLowerCase();
	}

	return normalized.toLowerCase();
};

const getIncludedPages = (displayRules) => {
	if (!Array.isArray(displayRules?.includedPages)) {
		return [];
	}

	return displayRules.includedPages
		.map(normalizePath)
		.filter((value, index, list) => Boolean(value) && list.indexOf(value) === index);
};

const isPopupVisibleForPath = ({ displayRules, pathname }) => {
	const includedPages = getIncludedPages(displayRules);

	if (includedPages.length === 0) {
		return true;
	}

	const normalizedPathname = normalizePath(pathname);
	return includedPages.includes(normalizedPathname);
};

const toSafeCta = (cta) => {
	const url = typeof cta?.url === "string" ? cta.url.trim() : "";

	if (!url || url === "#" || url === "/#") {
		return null;
	}

	const style = String(cta?.style || "").trim().toLowerCase();
	const normalizedStyle = style === "text_link" ? "text_link" : "primary";
	const fallbackLabel = normalizedStyle === "text_link" ? "View Offer" : "Book Now";

	return {
		label: typeof cta?.label === "string" && cta.label.trim() ? cta.label.trim() : fallbackLabel,
		url,
		style: normalizedStyle,
		openInNewTab: cta?.openInNewTab === true,
	};
};

const toSafeOffer = (item, popupTitle) => {
	const ctas = Array.isArray(item?.ctas)
		? item.ctas.map(toSafeCta).filter(Boolean)
		: [];

	return {
		title: popupTitle,
		subtitle: typeof item?.subtitle === "string" ? item.subtitle : "",
		description: typeof item?.description === "string" ? item.description : "",
		image: {
			desktopImage: item?.desktopImage || null,
			tabletImage: item?.tabletImage || null,
			mobileImage: item?.mobileImage || null,
		},
		ctas,
	};
};

const resolvePopupLogo = (popup) => {
	const candidate =
		popup?.content?.logo ||
		popup?.logo ||
		popup?.container?.logo ||
		null;

	if (candidate && typeof candidate === "object" && typeof candidate.url === "string") {
		return candidate;
	}

	return null;
};

export default function usePopupOffers({ pathname, shouldFetchOffers }) {
	const [rawData, setRawData] = useState([]);

	useEffect(() => {
		if (!shouldFetchOffers) {
			return undefined;
		}

		let isSubscribed = true;
		const controller = new AbortController();

		const loadOfferData = async () => {
			try {
				const response = await fetch("/api/pop-ups", {
					method: "GET",
					headers: {
						Accept: "application/json",
					},
					cache: "no-store",
					signal: controller.signal,
				});

				if (!response.ok) {
					throw new Error("Failed to fetch pop-up offers");
				}

				const items = await response.json();

				if (!isSubscribed) {
					return;
				}

				setRawData(Array.isArray(items) ? items : []);
			} catch (error) {
				if (error?.name === "AbortError") {
					return;
				}

				if (isSubscribed) {
					setRawData([]);
				}
			}
		};

		loadOfferData();

		return () => {
			isSubscribed = false;
			controller.abort();
		};
	}, [shouldFetchOffers]);

	const popupModel = useMemo(() => {
		if (!Array.isArray(rawData) || rawData.length === 0) {
			return null;
		}

		const validPopups = rawData.filter(
			(item) =>
				item &&
				typeof item === "object" &&
				item.type === "offer_promotion" &&
				item.content &&
				Array.isArray(item.content.items) &&
				item.content.items.length > 0,
		);

		if (validPopups.length === 0) {
			return null;
		}

		const selectedPopup =
			validPopups.find((popup) =>
				isPopupVisibleForPath({ displayRules: popup.displayRules, pathname }),
			) || null;

		if (!selectedPopup) {
			return null;
		}

		const popupTitle =
			typeof selectedPopup?.content?.title === "string" &&
			selectedPopup.content.title.trim()
				? selectedPopup.content.title.trim()
				: "Special Offers";

		const offers = selectedPopup.content.items
			.map((item) => toSafeOffer(item, popupTitle))
			.filter((item) => {
				const hasImage =
					item.image.desktopImage || item.image.tabletImage || item.image.mobileImage;
				const hasText = item.subtitle || item.description;
				return Boolean(hasImage || hasText || item.ctas.length > 0);
			});

		if (offers.length === 0) {
			return null;
		}

		return {
			offers,
			logo: resolvePopupLogo(selectedPopup),
			popupTitle,
			popupDelay: selectedPopup?.behavior?.delay,
		};
	}, [rawData, pathname]);

	return {
		offers: popupModel?.offers || [],
		popupTitle: popupModel?.popupTitle || "Special Offers",
		popupDelay: popupModel?.popupDelay,
		logo: popupModel?.logo,
	};
}
