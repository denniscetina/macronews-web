const SITE_ZONE = "America/Cancun";
const locale = (lang) => (lang === "es" ? "es-MX" : lang);

/** "12 sep" in the current year, "12 sep 2025" before (core NewsCarousel guide, rule D), in the site's time zone. Empty when the date is not valid. */
export function shortDate(iso, lang, now = Date.now()) {
	const time = iso ? Date.parse(iso) : Number.NaN;
	if (!Number.isFinite(time)) {
		return "";
	}
	const year = (value) => new Intl.DateTimeFormat("en-CA", { year: "numeric", timeZone: SITE_ZONE }).format(value);
	const options = year(time) === year(now) ? { day: "numeric", month: "short" } : { day: "numeric", month: "short", year: "numeric" };
	return new Intl.DateTimeFormat(locale(lang), { ...options, timeZone: SITE_ZONE }).format(time);
}

/** Calendar day (`YYYY-MM-DD`) of an instant in the site's time zone: "today" and "yesterday" are counted there, not in the reader's. */
const dayOf = (value) => new Intl.DateTimeFormat("en-CA", { timeZone: SITE_ZONE }).format(value);

/**
 * Relative date of a news item (core NewsCarousel guide 1.3.0, point 4): "Hace un momento" (< 1 min), "Hace 25 min",
 * "Hace 1 hora" ... "Hace 8 horas" (whole hours, rounded down), "Hoy" (older, same day), "Ayer", and before that "12 sep" /
 * "12 sep 2025". The server prints the plain date and the browser swaps in this text (see `RelativeTime`).
 * @param {string | null} iso
 * @param {{ moment: string, min: string, hour: string, hours: string, today: string, yesterday: string }} labels Templates with {n}
 * @param {string} lang
 * @param {number} [now]
 */
export function timeAgo(iso, labels, lang, now = Date.now()) {
	const time = iso ? Date.parse(iso) : Number.NaN;
	if (!Number.isFinite(time)) {
		return "";
	}
	const fill = (template, n) => template.replace("{n}", String(n));
	const minutes = Math.floor((now - time) / 60000);
	if (minutes < 1) return labels.moment;
	if (minutes < 60) return fill(labels.min, minutes);
	const hours = Math.floor(minutes / 60);
	if (hours <= 8) return fill(hours === 1 ? labels.hour : labels.hours, hours);
	const day = dayOf(time);
	if (day === dayOf(now)) return labels.today;
	if (day === dayOf(now - 86400000)) return labels.yesterday;
	return shortDate(iso, lang, now);
}

/**
 * Whether an ISO date falls on the same calendar day as `now` in Cancún time (the site's time zone). Reel cards say
 * "Hoy" for these instead of "Hace N horas" (Figma "Macro Reels").
 * @param {string | null} iso
 * @param {number} [now]
 */
export function isToday(iso, now = Date.now()) {
	const time = iso ? Date.parse(iso) : Number.NaN;
	if (!Number.isFinite(time)) {
		return false;
	}
	const day = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Cancun" });
	return day.format(time) === day.format(now);
}
