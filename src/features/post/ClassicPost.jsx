import Image from "next/image";
import SiteLink from "@/components/ui/SiteLink";
import { getDictionary } from "@/i18n";
import { originOf } from "@/server/cms/mappers/links";
import { cleanHtml } from "@/server/content/clean-html";

/** "10 de Noviembre, 2026" (the format of the design's dates); other languages use their long date. */
function formatDate(iso, lang) {
	const time = iso ? Date.parse(iso) : Number.NaN;
	if (!Number.isFinite(time)) {
		return "";
	}
	const options = { day: "numeric", month: "long", year: "numeric", timeZone: "America/Cancun" };
	if (lang !== "es") {
		return new Intl.DateTimeFormat(lang, options).format(time);
	}
	const parts = Object.fromEntries(new Intl.DateTimeFormat("es-MX", options).formatToParts(time).map((part) => [part.type, part.value]));
	return `${parts.day} de ${parts.month.charAt(0).toUpperCase()}${parts.month.slice(1)}, ${parts.year}`;
}

/**
 * Classic post template: the fallback for the news history. It does not use blocks, only the post `content` as the
 * CMS sends it (cleaned, see `cleanHtml`). Built from the Figma `Single Post` (#FAFAFA band, one 628px column, the
 * side ads and the blocks of that design are left out): cover 628x353 with radius 16, title (Montserrat 800 24/32),
 * a line with the author and the date, the body (Inter 400 14/22, subheads Inter 700 18/22, `.article-content` in
 * globals.css) over a line, and the tags. The category pill above the title and the tags as plain chips are not in the
 * design (the pill follows the news cards; tag pages do not exist yet).
 * @param {{ post: NonNullable<ReturnType<typeof import("@/server/cms/mappers/post").mapPost>>, site: any, lang: string }} props
 */
export default async function ClassicPost({ post, site, lang }) {
	const { post: labels } = await getDictionary(lang);
	const origins = [originOf(site?.url), originOf(site?.cmsUrl)].filter(Boolean);
	const html = cleanHtml(post.content, origins);
	const date = formatDate(post.publishedAt, lang);
	const category = post.categories[0];
	return (
		<article className="bg-[#fafafa]">
			<div className="mx-auto flex w-full max-w-[660px] flex-col gap-4 px-4 py-8 md:py-12">
				{post.image ? (
					<div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-charcoal">
						<Image src={post.image.url} alt={post.image.alt || post.title} fill priority sizes="(min-width: 676px) 628px, 100vw" className="object-cover" />
					</div>
				) : null}
				<div className="flex flex-col items-start gap-2">
					{category?.name ? (
						<SiteLink href={`/${category.slug}/`} className="cursor-pointer rounded-full bg-macro-red px-2.5 py-1 text-[11px]/[14px] font-bold uppercase tracking-[0.88px] text-white transition hover:opacity-90">
							{category.name}
						</SiteLink>
					) : null}
					<h1 className="font-display text-2xl/8 font-extrabold text-[#171717] text-balance">{post.title}</h1>
				</div>
				{post.author.name || date ? (
					<div className="flex items-start justify-between gap-4 border-t border-[#e5e5e5] pb-4 pt-2 text-[11px]/4 text-[#737373]">
						{post.author.name ? <p className="font-semibold text-[#171717]">{labels.by.replace("{name}", post.author.name)}</p> : <span />}
						{date ? <time dateTime={post.publishedAt}>{date}</time> : null}
					</div>
				) : null}
				<div className="article-content border-b border-[#e5e5e5] pb-6 pt-3" dangerouslySetInnerHTML={{ __html: html }} />
				{post.tags.length > 0 ? (
					<div className="flex flex-col gap-3 pb-4">
						<p className="text-[11px]/4 font-semibold uppercase tracking-[1.1px] text-[#737373]">{labels.tags}</p>
						<ul className="flex flex-wrap gap-2">
							{post.tags.map((tag) => (
								<li key={tag.slug} className="rounded-full bg-[#a3a3a3]/20 px-3.5 py-2 text-xs/[15px] text-black">
									#{tag.name.replace(/\s+/g, "")}
								</li>
							))}
						</ul>
					</div>
				) : null}
			</div>
		</article>
	);
}
