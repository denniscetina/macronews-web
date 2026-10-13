import SiteLink from "@/components/ui/SiteLink";
import Logo from "./Logo";
import SocialLinks from "./SocialLinks";

const linkClass = "text-neutral-400 hover:text-white";

/**
 * Link columns come from `footer_menu`: each top-level item is a column heading and its children
 * are the links (e.g. "Secciones" > Seguridad, Política...; "Regiones" > Cancún, Tulum...).
 * Top-level items without children are grouped into one heading-less column.
 */
function buildColumns(menu) {
	const columns = menu.filter((item) => item.children.length > 0).map((item) => ({ key: item.id ?? item.label, heading: item.label, links: item.children }));
	const loose = menu.filter((item) => item.children.length === 0);
	return loose.length > 0 ? [{ key: "loose", heading: "", links: loose }, ...columns] : columns;
}

function Column({ column }) {
	return (
		<nav aria-label={column.heading || undefined} className="space-y-4">
			{column.heading ? <h2 className="font-display text-xs font-semibold uppercase tracking-[0.05em] text-white">{column.heading}</h2> : null}
			<ul className="space-y-2.5 text-xs">
				{column.links.map((link, index) => (
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

/**
 * Black footer. Everything comes from the CMS; blocks without data are not rendered.
 * Optional background: an "Other asset" with key `footerBackground` in CMS > Brand.
 * @param {{ lang: string, site: any, name: string, menu: any[], legalMenu: any[], dictionary: any }} props
 */
export default function Footer({ lang, site, name, menu, legalMenu, dictionary }) {
	const { layout } = dictionary;
	const brand = site?.brand;
	const contacts = site?.contacts ?? [];
	const columns = buildColumns(menu);
	const description = site?.description || brand?.tagline;
	const background = brand?.otherAssets.find((asset) => asset.key === "footerBackground")?.image;
	const hasContact = contacts.length > 0 || brand?.address || brand?.businessHours || (site?.social ?? []).length > 0;

	return (
		<footer className="relative isolate overflow-hidden bg-ink text-neutral-400">
			{background ? (
				<>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={background.url} alt="" className="absolute inset-0 -z-20 size-full object-cover opacity-40" />
					<div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink via-ink/80 to-ink" />
				</>
			) : null}

			<div className="container-site grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.2fr_repeat(3,1fr)] lg:gap-12">
				<div className="space-y-4">
					<Logo lang={lang} name={name} logo={brand?.logoLight} logoOnDark={brand?.logoDark} />
					{description ? <p className="max-w-xs text-xs leading-[1.625]">{description}</p> : null}
				</div>

				{columns.map((column) => (
					<Column key={column.key} column={column} />
				))}

				{hasContact ? (
					<div className="space-y-4">
						<h2 className="font-display text-xs font-semibold uppercase tracking-[0.05em] text-white">{layout.contact}</h2>
						<div className="space-y-2.5 text-xs">
							{brand?.address ? <p className="whitespace-pre-line">{brand.address}</p> : null}
							{brand?.businessHours ? <p className="whitespace-pre-line">{brand.businessHours}</p> : null}
							{contacts.map((contact, index) => (
								<p key={`${contact.value}-${index}`}>
									{contact.name ? <span>{contact.name}: </span> : null}
									<SiteLink href={contact.href} external className="font-display font-semibold text-white hover:underline">
										{contact.value}
									</SiteLink>
								</p>
							))}
						</div>
						<SocialLinks items={site?.social ?? []} className="text-xs" />
					</div>
				) : null}
			</div>

			<div className="border-t border-white/10">
				<div className="container-site flex flex-col items-center justify-between gap-3 py-5 font-display text-[0.6875rem] font-light text-[#bcbcbc] sm:flex-row">
					<p>
						© {new Date().getFullYear()} {brand?.legalName || name}. {layout.rights}
					</p>
					{legalMenu.length > 0 ? (
						<nav aria-label={layout.legalNav}>
							<ul className="flex items-center gap-6">
								{legalMenu.map((item, index) => (
									<li key={item.id ?? index}>
										<SiteLink href={item.href} external={item.external} target={item.target ?? undefined} className="hover:text-white">
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
