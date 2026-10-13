import Link from "next/link";
import { LOCALES } from "@/config/site";
import { localizePath } from "@/i18n";

/**
 * Only renders when more than one language is enabled in `config/site.js`, so it stays
 * invisible while the site is Spanish-only. Switches to the home of the chosen language.
 */
export default function LanguageSwitcher({ lang, label }) {
	if (LOCALES.length < 2) {
		return null;
	}
	return (
		<ul aria-label={label} className="flex items-center gap-2 uppercase">
			{LOCALES.map((code) => (
				<li key={code}>
					<Link href={localizePath(code)} hrefLang={code} aria-current={code === lang ? "true" : undefined} className={code === lang ? "font-bold" : "hover:text-accent"}>
						{code}
					</Link>
				</li>
			))}
		</ul>
	);
}
