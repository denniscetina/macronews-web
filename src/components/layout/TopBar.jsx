import SiteLink from "@/components/ui/SiteLink";
import LanguageSwitcher from "./LanguageSwitcher";
import TodayDate from "./TodayDate.client";

/**
 * Black utility strip (33px). Right side: date, language switcher (only with 2+ languages)
 * and the `secondary_menu` links, highlighted in yellow ("Nuestros ojos").
 */
export default function TopBar({ lang, menu, dictionary }) {
	return (
		<div className="border-b border-white/10 bg-ink text-[0.6875rem] font-medium tracking-[0.05em] text-white">
			<div className="container-site flex h-[33px] items-center justify-end gap-6">
				<TodayDate lang={lang} />
				<LanguageSwitcher lang={lang} label={dictionary.layout.language} />
				{menu.length > 0 ? (
					<nav aria-label={dictionary.layout.secondaryNav}>
						<ul className="flex items-center gap-4">
							{menu.map((item, index) => (
								<li key={item.id ?? index}>
									<SiteLink href={item.href} external={item.external} target={item.target ?? undefined} className="font-semibold uppercase text-accent hover:underline">
										{item.label}
									</SiteLink>
								</li>
							))}
						</ul>
					</nav>
				) : null}
			</div>
		</div>
	);
}
