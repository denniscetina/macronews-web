import Image from "next/image";
import SiteLink from "@/components/ui/SiteLink";
import { colorVar } from "@/lib/design-tokens";
import Logo from "./Logo";
import SocialLinks from "./SocialLinks";

const linkClass = "text-gray transition-colors hover:text-white";
const titleClass = "font-display text-xs/4 font-semibold uppercase tracking-[0.6px] text-white";

/** A footer column: title (from the CMS, hidden when empty) and a flat list of links, 10px apart (Figma). */
function Column({ title, label, links }) {
	if (links.length === 0) {
		return null;
	}
	return (
		<nav aria-label={title || label} className="space-y-4">
			{title ? <h2 className={titleClass}>{title}</h2> : null}
			<ul className="space-y-2.5 text-xs/4">
				{links.map((link, index) => (
					<li key={link.id ?? index}>
						<SiteLink href={link.href} external={link.external} target={link.target ?? undefined} className={linkClass}>
							{link.label}
						</SiteLink>
					</li>
				))}
			</ul>
		</nav>
	);
}

/** Background image of the footer (mobile one under 768px) with the Figma black layer at 90% over it (Lineal Gradiente #000000 / #000000, 90%). */
function Background({ background }) {
	const desktop = background.desktop ?? background.mobile;
	const mobile = background.mobile ?? desktop;
	if (!desktop) {
		return null;
	}
	return (
		<>
			<Image src={mobile.url} alt="" fill sizes="100vw" className="-z-10 object-cover md:hidden" />
			<Image src={desktop.url} alt="" fill sizes="100vw" className="-z-10 hidden object-cover md:block" />
			<div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/90" />
		</>
	);
}

/**
 * Black footer (Figma Component: Footer): 1px #171717 line on top, 64px above and 48px below, a 4 column grid
 * (brand + description, menu, secondary menu, contact + social) with 48px between columns, a 1px line, and the
 * copyright and legal links at the bottom. Everything comes from the CMS (MacroPress > Header y Footer, menus,
 * Contact List and Social Channels); what is empty is not rendered. The background image gets the Figma black
 * layer at 90% on top (the core spec says to show it untouched, the design darkens it: the design wins here).
 * @param {{ lang: string, site: any, name: string, menu: any[], secondaryMenu: any[], legalMenu: any[], dictionary: any }} props
 */
export default function Footer({ lang, site, name, menu, secondaryMenu, legalMenu, dictionary }) {
	const { layout } = dictionary;
	const brand = site?.brand;
	const footer = site?.footer;
	const contacts = site?.contacts ?? [];
	const social = site?.social ?? [];
	const description = footer?.description || site?.description || brand?.tagline;
	const copyright = footer?.copyright || `© ${new Date().getFullYear()} ${brand?.legalName || name}. ${layout.rights}`;
	const background = footer?.background ?? { color: "", desktop: null, mobile: null };
	const hasContact = contacts.length > 0 || social.length > 0;

	return (
		<footer className="relative isolate overflow-hidden border-t border-[#171717] bg-black text-gray" style={{ backgroundColor: colorVar(background.color) }}>
			<Background background={background} />

			<div className="container-site pb-12 pt-16 md:min-h-[491px]">
				<div className="grid gap-12 border-b border-[#171717] pb-12 sm:grid-cols-2 lg:grid-cols-4">
					<div className="space-y-4">
						<Logo lang={lang} name={name} logo={brand?.logoLight} logoOnDark={brand?.logoDark} size="footer" />
						{description ? <p className="max-w-[268px] text-xs/[19.5px] text-[#737373]">{description}</p> : null}
					</div>

					<Column title={footer?.columns.menu} label={layout.mainNav} links={menu} />
					<Column title={footer?.columns.secondaryMenu} label={layout.secondaryNav} links={secondaryMenu} />

					{hasContact ? (
						<div className="space-y-4">
							<h2 className={titleClass}>{footer?.columns.contact || layout.contact}</h2>
							<div className="space-y-2 text-xs/4">
								{contacts.map((contact, index) =>
									contact.href ? (
										<p key={`${contact.value}-${index}`}>
											{contact.name && contact.name !== contact.value ? <span className="mr-1 text-[#737373]">{contact.name}:</span> : null}
											<SiteLink href={contact.href} external className="font-display font-semibold text-white hover:underline">
												{contact.value}
											</SiteLink>
										</p>
									) : (
										<p key={`${contact.value}-${index}`} className="text-[#737373]">
											{contact.value}
										</p>
									),
								)}
							</div>
							<SocialLinks items={social} />
						</div>
					) : null}
				</div>

				<div className="flex flex-col items-start justify-between gap-4 pt-8 font-display text-[11px]/4 font-light text-[#bcbcbc] sm:flex-row sm:items-center">
					<p>{copyright}</p>
					{legalMenu.length > 0 ? (
						<nav aria-label={layout.legalNav}>
							<ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
								{legalMenu.map((item, index) => (
									<li key={item.id ?? index}>
										<SiteLink href={item.href} external={item.external} target={item.target ?? undefined} className="transition-colors hover:text-white">
											{item.label}
										</SiteLink>
									</li>
								))}
							</ul>
						</nav>
					) : null}
				</div>
			</div>
		</footer>
	);
}
