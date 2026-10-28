/**
 * "Hace 45 min" / "Hace 2 horas" / "Hace 3 días" from an ISO date; older than a week -> short date.
 * @param {string | null} iso
 * @param {{ min: string, hour: string, hours: string, day: string, days: string }} labels Templates with {n}
 * @param {string} lang
 * @param {number} [now]
 */
export function timeAgo(iso, labels, lang, now = Date.now()) {
	const time = iso ? Date.parse(iso) : Number.NaN;
	if (!Number.isFinite(time)) {
		return "";
	}
	const minutes = Math.max(1, Math.round((now - time) / 60000));
	const fill = (template, n) => template.replace("{n}", String(n));
	if (minutes < 60) return fill(labels.min, minutes);
	const hours = Math.round(minutes / 60);
	if (hours < 24) return fill(hours === 1 ? labels.hour : labels.hours, hours);
	const days = Math.round(hours / 24);
	if (days < 7) return fill(days === 1 ? labels.day : labels.days, days);
	return new Intl.DateTimeFormat(lang, { day: "numeric", month: "short", timeZone: "America/Cancun" }).format(time);
}
