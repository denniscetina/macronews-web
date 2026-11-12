import AdSlot from "@/components/ui/AdSlot";
import SectionFrame from "@/components/ui/SectionFrame";
import SectionHeading from "@/components/ui/SectionHeading";
import SiteLink from "@/components/ui/SiteLink";
import { getDictionary } from "@/i18n";
import List from "./List.client";

// Figma `Section\AHORA CERCA DE TI` (Category Page): white band, 1px #E5E5E5 above and below, 64px above, 128px below
// and 80px at the sides around a 1120px content.
const DEFAULTS = {
	padding: {
		desktop: { top: "4rem", right: "5rem", bottom: "8rem", left: "5rem" },
		mobile: { top: "2.5rem", right: "1rem", bottom: "4rem", left: "1rem" },
	},
};

/** "18:45" in the site's time zone (Cancún). */
function clock(iso) {
	const time = iso ? Date.parse(iso) : Number.NaN;
	return Number.isFinite(time) ? new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Cancun" }).format(time) : "";
}

/** Sidebar card (Figma `Background+Border+Shadow`): 244px, radius 16, 1px #E5E5E5, 20/16 padding, 16px gap, 0 1px 2px 5% shadow. */
/**
 * Locations as a tree (core 1.0.0: a state brings its municipalities as `children`). The design draws flat chips: the
 * children are the same chips nested under their parent with a left line (provisional, until design draws the tree).
 */
function Places({ items }) {
	return (
		<ul className="flex flex-wrap gap-2">
			{items.map((place) => (
				<li key={place.id} className={place.children.length > 0 ? "w-full" : undefined}>
					<SiteLink href={place.url} className="inline-block cursor-pointer rounded-full bg-[#a3a3a3]/20 px-3.5 py-2 text-xs/[15px] text-black hover:bg-[#a3a3a3]/35">
						{place.name}
					</SiteLink>
					{place.children.length > 0 ? (
						<div className="ml-3 mt-2 border-l border-[#e5e5e5] pl-3">
							<Places items={place.children} />
						</div>
					) : null}
				</li>
			))}
		</ul>
	);
}

function Box({ title, children }) {
	return (
		<section className="flex flex-col gap-4 rounded-2xl border border-[#e5e5e5] bg-white px-4 py-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
			{title ? <h3 className="font-display text-sm/5 font-extrabold uppercase text-[#050505]">{title}</h3> : null}
			{children}
		</section>
	);
}

/**
 * Posts list of a section page (CMS `BlogListing`; Figma `Category Page > Section\AHORA CERCA DE TI`, 1120px, 828px list +
 * 244px sidebar, 48px apart): the section title over a 1px line, an ad, the posts (an ad every 4) and "Cargar más".
 * The sidebar blocks follow the order the CMS sends: `latest` (time + title), `most_read` (numbered), `locations` (chips)
 * and `ad`. Not drawn in the design, so not built: the category `filters`, the `kicker` on each post and the children of
 * a location. Not in the core docs yet (dev-01 has not pushed it).
 * @param {{ data: ReturnType<typeof import("@/server/cms/mappers/sections").mapSections>[number]["data"], lang: string }} props
 */
export default async function BlogListing({ data, lang }) {
	const { modules } = await getDictionary(lang);
	if (data.items.length === 0) {
		return null;
	}
	const labels = { ...modules.blogListing, adLabel: modules.news.adLabel };
	return (
		<SectionFrame spacing={data.spacing} defaults={DEFAULTS} className="border-y border-[#e5e5e5] bg-white">
			<div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_244px]">
				<div className="flex min-w-0 flex-col gap-8">
					{data.heading ? (
						<div className="border-b border-[#e5e5e5] pb-4">
							<SectionHeading heading={data.heading} />
						</div>
					) : null}
					{data.ads ? <AdSlot ads={data.ads} lang={lang} label={labels.adLabel} only="mobile" /> : null}
					<div>
						<List items={data.items} initial={data.pagination.initial} card={data.card} ads={data.ads} lang={lang} labels={labels} newsLabels={modules.news} adLabel={labels.adLabel} />
					</div>
				</div>
				{data.sidebar.length > 0 ? (
					<aside className="flex min-w-0 flex-col gap-6">
						{data.sidebar.map((block, index) => {
							if (block.type === "ad") {
								return data.showAds && block.ads ? <AdSlot key={index} ads={block.ads} lang={lang} label={labels.adLabel} /> : null;
							}
							if (block.type === "latest") {
								return (
									<Box key={index} title={block.title || labels.latest}>
										<ul className="flex flex-col gap-4">
											{block.items.map((post) => (
												<li key={post.id}>
													<SiteLink href={post.url} className="flex flex-col gap-1 hover:text-primary">
														{clock(post.publishedAt) ? <span className="font-display text-[11px]/4 font-semibold text-burgundy">{`${clock(post.publishedAt)} ${labels.hours}`}</span> : null}
														<span className="text-xs/[18px] font-medium text-[#171717]">{post.title}</span>
													</SiteLink>
												</li>
											))}
										</ul>
									</Box>
								);
							}
							if (block.type === "most_read") {
								return (
									<Box key={index} title={block.title || labels.mostRead}>
										<ol className="flex flex-col gap-4">
											{block.items.map((post, position) => (
												<li key={post.id}>
													<SiteLink href={post.url} className="flex gap-2 hover:text-primary">
														<span className="w-[17px] shrink-0 font-display text-xs/5 font-medium text-[#a3a3a3]">{String(position + 1).padStart(2, "0")}</span>
														<span className="text-xs/[18px] font-medium text-[#171717]">{post.title}</span>
													</SiteLink>
												</li>
											))}
										</ol>
									</Box>
								);
							}
							return (
								<Box key={index} title={block.title}>
									<Places items={block.items} />
								</Box>
							);
						})}
					</aside>
				) : null}
			</div>
		</SectionFrame>
	);
}
