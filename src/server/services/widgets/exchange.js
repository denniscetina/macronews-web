import "server-only";
import { getEnv } from "@/config/env";
import { EXCHANGE, WIDGET_TIMEOUT_MS } from "@/config/widgets";

/**
 * Latest peso per dollar and peso per euro from Banco de México (SIE API, "oportuno" = latest datum).
 * Returns null without BANXICO_TOKEN or when the service fails; a currency without a datum ("N/E") is null.
 * @returns {Promise<{ usd: number | null, eur: number | null } | null>}
 */
export async function getExchangeRates() {
	const token = getEnv().BANXICO_TOKEN;
	if (!token) {
		return null;
	}
	try {
		const ids = Object.values(EXCHANGE.series).join(",");
		const response = await fetch(`${EXCHANGE.baseUrl}/series/${ids}/datos/oportuno`, {
			headers: { "Bmx-Token": token, Accept: "application/json" },
			next: { revalidate: EXCHANGE.revalidate },
			signal: AbortSignal.timeout(WIDGET_TIMEOUT_MS),
		});
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}
		const series = (await response.json())?.bmx?.series ?? [];
		const valueOf = (id) => {
			const value = Number(series.find((entry) => entry.idSerie === id)?.datos?.[0]?.dato);
			return Number.isFinite(value) && value > 0 ? value : null;
		};
		const rates = { usd: valueOf(EXCHANGE.series.usd), eur: valueOf(EXCHANGE.series.eur) };
		return rates.usd || rates.eur ? rates : null;
	} catch (error) {
		console.error("[exchange] could not load the exchange rates:", error.message);
		return null;
	}
}
