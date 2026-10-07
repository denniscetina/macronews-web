'use client';

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';

const SITE_INIT_ENDPOINT = '/api/site-init';
const SITE_INIT_CACHE_VERSION = 'v1';
const SITE_INIT_TTL_MS = 5 * 60 * 1000;
const SITE_INIT_ACTIVE_KEY = `siteinit:${SITE_INIT_CACHE_VERSION}:active`;

const SiteInitContext = createContext(null);

let siteInitMemoryEntry = null;
let siteInitRequestPromise = null;

const getParameterDefaultValue = (parameters, key) => {
	if (Array.isArray(parameters)) {
		const found = parameters.find((parameter) => parameter?.key === key);
		return found?.defaultValue;
	}

	if (parameters && typeof parameters === 'object') {
		const rawParameter = parameters[key];

		if (rawParameter && typeof rawParameter === 'object') {
			return rawParameter.defaultValue ?? rawParameter.default;
		}

		return rawParameter;
	}

	return undefined;
};

const normalizeCacheToken = (value) => {
	const token = String(value ?? '')
		.trim()
		.toLowerCase();

	return token || 'unknown';
};

const getStorage = () => {
	if (typeof window === 'undefined') {
		return null;
	}

	try {
		return window.sessionStorage;
	} catch {
		return null;
	}
};

const getLanguageToken = () => {
	if (typeof document !== 'undefined') {
		const htmlLang = document.documentElement?.lang;

		if (typeof htmlLang === 'string' && htmlLang.trim() !== '') {
			return normalizeCacheToken(htmlLang);
		}
	}

	if (typeof navigator !== 'undefined' && navigator.language) {
		return normalizeCacheToken(navigator.language);
	}

	return 'unknown';
};

const buildSiteInitCacheKey = (siteInitPayload) => {
	const marketToken = normalizeCacheToken(siteInitPayload?.market?.marketCode);
	const countryToken = normalizeCacheToken(siteInitPayload?.geo?.countryCode);
	const localeToken = normalizeCacheToken(
		getParameterDefaultValue(
			siteInitPayload?.booking?.widget?.options?.hotel?.parameters,
			'locale',
		) ?? getLanguageToken(),
	);

	return `siteinit:${SITE_INIT_CACHE_VERSION}:${marketToken}:${countryToken}:${localeToken}`;
};

const parseCachedEntry = (cacheKey, rawValue) => {
	if (typeof rawValue !== 'string' || rawValue.trim() === '') {
		return null;
	}

	try {
		const parsed = JSON.parse(rawValue);

		if (
			!parsed ||
			typeof parsed !== 'object' ||
			typeof parsed.expiresAt !== 'number' ||
			!parsed.data ||
			typeof parsed.data !== 'object'
		) {
			return null;
		}

		return {
			key: cacheKey,
			data: parsed.data,
			fetchedAt:
				typeof parsed.fetchedAt === 'number' && Number.isFinite(parsed.fetchedAt)
					? parsed.fetchedAt
					: 0,
			expiresAt: parsed.expiresAt,
		};
	} catch {
		return null;
	}
};

const readCachedSiteInitEntry = () => {
	const storage = getStorage();

	if (!storage) {
		return null;
	}

	const activeCacheKey = storage.getItem(SITE_INIT_ACTIVE_KEY);

	if (!activeCacheKey) {
		return null;
	}

	const rawValue = storage.getItem(activeCacheKey);
	return parseCachedEntry(activeCacheKey, rawValue);
};

const persistSiteInitPayload = (siteInitPayload) => {
	const cacheKey = buildSiteInitCacheKey(siteInitPayload);
	const now = Date.now();
	const cacheEntry = {
		key: cacheKey,
		data: siteInitPayload,
		fetchedAt: now,
		expiresAt: now + SITE_INIT_TTL_MS,
	};

	siteInitMemoryEntry = cacheEntry;

	const storage = getStorage();

	if (!storage) {
		return siteInitPayload;
	}

	try {
		storage.setItem(
			cacheKey,
			JSON.stringify({
				data: cacheEntry.data,
				fetchedAt: cacheEntry.fetchedAt,
				expiresAt: cacheEntry.expiresAt,
			}),
		);
		storage.setItem(SITE_INIT_ACTIVE_KEY, cacheKey);
	} catch {
		// If storage quota is exceeded or unavailable, keep runtime cache only.
	}

	return siteInitPayload;
};

const fetchSiteInitPayload = async () => {
	const response = await fetch(SITE_INIT_ENDPOINT, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
		},
		cache: 'no-store',
	});

	if (!response.ok) {
		throw new Error('Failed to fetch site init data');
	}

	return response.json();
};

const refreshSiteInitPayload = async () => {
	if (!siteInitRequestPromise) {
		siteInitRequestPromise = fetchSiteInitPayload()
			.then((payload) => persistSiteInitPayload(payload))
			.finally(() => {
				siteInitRequestPromise = null;
			});
	}

	return siteInitRequestPromise;
};

const resolveSiteInitPayload = async () => {
	const now = Date.now();

	if (siteInitMemoryEntry?.data) {
		if (siteInitMemoryEntry.expiresAt > now) {
			return {
				payload: siteInitMemoryEntry.data,
				revalidationPromise: null,
			};
		}

		return {
			payload: siteInitMemoryEntry.data,
			revalidationPromise: refreshSiteInitPayload(),
		};
	}

	const cachedEntry = readCachedSiteInitEntry();

	if (cachedEntry?.data) {
		siteInitMemoryEntry = cachedEntry;

		if (cachedEntry.expiresAt > now) {
			return {
				payload: cachedEntry.data,
				revalidationPromise: null,
			};
		}

		return {
			payload: cachedEntry.data,
			revalidationPromise: refreshSiteInitPayload(),
		};
	}

	const payload = await refreshSiteInitPayload();

	return {
		payload,
		revalidationPromise: null,
	};
};

const normalizeBookingCollection = (items) => {
	if (!Array.isArray(items)) {
		return [];
	}

	return items.filter((item) => item && typeof item === 'object');
};

const toBookingSlugMap = (items) => {
	if (!Array.isArray(items)) {
		return {};
	}

	return items.reduce((accumulator, item) => {
		const slug = String(item?.slug ?? '')
			.trim()
			.toLowerCase();
		const bookingLink =
			typeof item?.bookingLink === 'string' ? item.bookingLink.trim() : '';

		if (slug && bookingLink) {
			accumulator[slug] = bookingLink;
		}

		return accumulator;
	}, {});
};

export function SiteInitProvider({ children }) {
	const [siteInitData, setSiteInitData] = useState(null);
	const [isSiteInitLoading, setIsSiteInitLoading] = useState(true);
	const [siteInitError, setSiteInitError] = useState(null);

	const loadSiteInit = useCallback(async () => {
		setIsSiteInitLoading(true);
		setSiteInitError(null);

		const { payload, revalidationPromise } = await resolveSiteInitPayload();
		setSiteInitData(payload);

		if (revalidationPromise) {
			revalidationPromise
				.then((nextPayload) => {
					setSiteInitData(nextPayload);
				})
				.catch(() => {
					// Keep stale data already rendered if background refresh fails.
				});
		}
	}, []);

	const refreshSiteInit = useCallback(async () => {
		setIsSiteInitLoading(true);
		setSiteInitError(null);

		try {
			const payload = await refreshSiteInitPayload();
			setSiteInitData(payload);
			return payload;
		} catch {
			setSiteInitError('Failed to load site init data');
			throw new Error('Failed to load site init data');
		} finally {
			setIsSiteInitLoading(false);
		}
	}, []);

	useEffect(() => {
		let isSubscribed = true;

		const run = async () => {
			try {
				await loadSiteInit();
			} catch {
				if (!isSubscribed) {
					return;
				}
				setSiteInitError('Failed to load site init data');
			} finally {
				if (isSubscribed) {
					setIsSiteInitLoading(false);
				}
			}
		};

		run();

		return () => {
			isSubscribed = false;
		};
	}, [loadSiteInit]);

	const contact = useMemo(() => siteInitData?.contact ?? null, [siteInitData]);
	const contactItems = useMemo(
		() => (Array.isArray(contact?.items) ? contact.items : []),
		[contact],
	);
	const primaryContact = useMemo(() => {
		if (contact?.primary && typeof contact.primary === 'object') {
			return contact.primary;
		}

		return contactItems[0] ?? null;
	}, [contact, contactItems]);

	const bookingWidget = useMemo(
		() =>
			siteInitData?.booking?.widget && typeof siteInitData.booking.widget === 'object'
				? siteInitData.booking.widget
				: null,
		[siteInitData],
	);

	const bookingOffers = useMemo(
		() => normalizeBookingCollection(siteInitData?.booking?.offers),
		[siteInitData],
	);
	const bookingRooms = useMemo(
		() => normalizeBookingCollection(siteInitData?.booking?.rooms),
		[siteInitData],
	);

	const bookingOffersBySlug = useMemo(
		() => toBookingSlugMap(bookingOffers),
		[bookingOffers],
	);
	const bookingRoomsBySlug = useMemo(
		() => toBookingSlugMap(bookingRooms),
		[bookingRooms],
	);

	const resolveOfferBookingLink = useCallback(
		(slug) => {
			const normalizedSlug = String(slug ?? '')
				.trim()
				.toLowerCase();

			return normalizedSlug ? bookingOffersBySlug[normalizedSlug] ?? '' : '';
		},
		[bookingOffersBySlug],
	);

	const resolveRoomBookingLink = useCallback(
		(slug) => {
			const normalizedSlug = String(slug ?? '')
				.trim()
				.toLowerCase();

			return normalizedSlug ? bookingRoomsBySlug[normalizedSlug] ?? '' : '';
		},
		[bookingRoomsBySlug],
	);

	const value = useMemo(
		() => ({
			siteInitData,
			isSiteInitLoading,
			siteInitError,
			contact,
			contactItems,
			primaryContact,
			bookingWidget,
			bookingOffers,
			bookingRooms,
			bookingOffersBySlug,
			bookingRoomsBySlug,
			resolveOfferBookingLink,
			resolveRoomBookingLink,
			refreshSiteInit,
		}),
		[
			siteInitData,
			isSiteInitLoading,
			siteInitError,
			contact,
			contactItems,
			primaryContact,
			bookingWidget,
			bookingOffers,
			bookingRooms,
			bookingOffersBySlug,
			bookingRoomsBySlug,
			resolveOfferBookingLink,
			resolveRoomBookingLink,
			refreshSiteInit,
		],
	);

	return <SiteInitContext.Provider value={value}>{children}</SiteInitContext.Provider>;
}

export function useSiteInit() {
	const context = useContext(SiteInitContext);

	if (!context) {
		throw new Error('useSiteInit must be used within a SiteInitProvider');
	}

	return context;
}
