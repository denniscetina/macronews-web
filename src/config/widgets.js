/**
 * Top bar widgets that do not come from the CMS (see `components/layout/TopBar`).
 * Weather: Open-Meteo (no key). Exchange rates: Banco de México SIE API (free token in BANXICO_TOKEN).
 */
export const WEATHER = {
	label: "Cancún, Q. Roo",
	latitude: 21.1619,
	longitude: -86.8515,
	timezone: "America/Cancun",
	/** Seconds the response is cached (Next fetch cache). */
	revalidate: 900,
};

export const EXCHANGE = {
	baseUrl: "https://www.banxico.org.mx/SieAPIRest/service/v1",
	/** SIE series: "FIX" peso per US dollar and peso per euro. */
	series: { usd: "SF43718", eur: "SF46410" },
	revalidate: 3600,
};

/** Give up on a third-party API after this long: the page must never wait on a widget. */
export const WIDGET_TIMEOUT_MS = 4000;
