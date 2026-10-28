import SiteLink from "@/components/ui/SiteLink";
import { getExchangeRates } from "@/server/services/widgets/exchange";
import { getWeather } from "@/server/services/widgets/weather";
import LanguageSwitcher from "./LanguageSwitcher";
import TodayDate from "./TodayDate.client";

const pesos = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

function Separator() {
	return <span aria-hidden="true" className="hidden h-4 w-px bg-white/15 md:block" />;
}

function PinIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5 shrink-0 fill-none stroke-primary stroke-[1.5]">
			<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
			<circle cx="12" cy="10" r="3" />
		</svg>
	);
}

/** "USD/MXN: $19.82" (Figma: label Inter 500, rate semibold, both #A3A3A3). */
function Rate({ code, value }) {
	return (
		<p className="hidden text-gray lg:block">
			{code}: <span className="font-semibold">{pesos.format(value)}</span>
		</p>
	);
}

/**
 * Black utility strip (33px). Left: weather of Cancún (Open-Meteo) and USD/EUR exchange rates (Banxico);
 * a widget whose service is down is simply left out. Right: date, language switcher (only with 2+ languages)
 * and the `secondary_menu` links, highlighted in yellow ("Nuestros ojos").
 */
export default async function TopBar({ lang, menu, dictionary }) {
	const [weather, rates] = await Promise.all([getWeather(), getExchangeRates()]);
	const { layout } = dictionary;
	return (
		<div className="border-b border-[#1c1c1c] bg-black text-[11px]/4 font-medium uppercase tracking-[0.05em] text-white">
			<div className="container-site flex h-8 items-center justify-between gap-6">
				<div className="flex min-w-0 items-center gap-6">
					{weather ? (
						<p className="hidden items-center gap-2 truncate sm:flex" aria-label={layout.weatherLabel}>
							<PinIcon />
							{weather.label} · {weather.temperature}°C {layout.weather[weather.condition]}
						</p>
					) : null}
					{weather && rates ? <Separator /> : null}
					{rates?.usd ? <Rate code="USD/MXN" value={rates.usd} /> : null}
					{rates?.usd && rates?.eur ? <Separator /> : null}
					{rates?.eur ? <Rate code="EUR/MXN" value={rates.eur} /> : null}
				</div>
				<div className="ml-auto flex items-center gap-6">
					<TodayDate lang={lang} />
					<LanguageSwitcher lang={lang} label={layout.language} />
					{menu.length > 0 ? (
						<nav aria-label={layout.secondaryNav}>
							<ul className="flex items-center gap-4">
								{menu.map((item, index) => (
									<li key={item.id ?? index}>
										<SiteLink href={item.href} external={item.external} target={item.target ?? undefined} className="font-semibold text-accent hover:underline">
											{item.label}
										</SiteLink>
									</li>
								))}
							</ul>
						</nav>
					) : null}
				</div>
			</div>
		</div>
	);
}
