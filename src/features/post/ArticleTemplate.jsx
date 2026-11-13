import Image from "next/image";
import SiteLink from "@/components/ui/SiteLink";
import { getDictionary } from "@/i18n";
import { originOf } from "@/server/cms/mappers/links";
import AdBlock from "./blocks/AdBlock";
import CustomHtml from "./blocks/CustomHtml";
import Embed from "./blocks/Embed.client";
import Gallery from "./blocks/Gallery.client";
import Media from "./blocks/Media";
import Quote from "./blocks/Quote";
import RelatedPost from "./blocks/RelatedPost";
import RichText from "./blocks/RichText";
import ReelPost from "./ReelPost";
import ShareBar from "./ShareBar.client";
import Summary from "./Summary";

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

function ClockIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5 shrink-0 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="12" r="9" />
			<path d="M12 7v5l3 2" />
		</svg>
	);
}

/**
 * News template (core `ArticleTemplate`, `post.sections[0]`), built from the Figma `Single Post`: a #FAFAFA band with one 628px
 * column (32px above and below, 16px between pieces) and the share bar in the left gutter. Header: category pill, cover 16:9 with
 * radius 16, title (Montserrat 800 24/32), the excerpt as the lead, the author line with the reading time, the date and the location,
 * and the "Resumen en 30 segundos" when the CMS sends it. Then the body, one component per block in the CMS order (`RichText`, `Media`,
 * `Gallery`, `Quote`, `RelatedPost`, `Embed`, `AdSlot`, `CustomHtmlBlock`), and the tags. A `legacy` news is one `RichText` block, so
 * it looks like every other. A `reel` news has its own template. Not designed yet and left out: the author's avatar, role and card
 * (the CMS sends only the name), "Escuchar", the bookmark, the side ads and the related-news carousel (see the README).
 * @param {{ post: NonNullable<ReturnType<typeof import("@/server/cms/mappers/post").mapPost>>, site: any, lang: string }} props
 */
export default async function ArticleTemplate({ post, site, lang }) {
	const dictionary = await getDictionary(lang);
	const { post: labels, modules } = dictionary;
	const { article } = post;
	if (article.format === "reel") {
		return <ReelPost article={article} labels={labels} />;
	}
	const origins = [originOf(site?.url), originOf(site?.cmsUrl)].filter(Boolean);
	const date = formatDate(article.publishedAt, lang);
	// Canonical address of the news (public host of the site + its path), what the share buttons send.
	const url = `${String(site?.url ?? "").replace(/\/+$/, "")}${post.path}`;
	const { category } = article;
	const renderBlock = (block, index) => {
		const key = `${block.type}-${index}`;
		switch (block.type) {
			case "RichText":
				return <RichText key={key} data={block.data} origins={origins} />;
			case "Media":
				return <Media key={key} data={block.data} />;
			case "Gallery":
				return <Gallery key={key} data={block.data} labels={labels} carouselLabels={modules.carousel} />;
			case "Quote":
				return <Quote key={key} data={block.data} />;
			case "RelatedPost":
				return <RelatedPost key={key} data={block.data} labels={labels} newsLabels={modules.news} lang={lang} />;
			case "Embed":
				return <Embed key={key} data={block.data} labels={labels} />;
			case "AdSlot":
				return <AdBlock key={key} data={block.data} lang={lang} label={modules.news.adLabel} />;
			case "CustomHtmlBlock":
				return <CustomHtml key={key} data={block.data} />;
			default:
				return null;
		}
	};
	return (
		<article className="relative bg-[#fafafa]">
			<div className="mx-auto hidden w-full max-w-[1280px] xl:block">
				<div className="absolute left-9 top-0 h-full">
					<div className="sticky top-28 pt-12">
						<div className="relative">
							<ShareBar url={url} title={article.title} labels={labels.share} />
						</div>
					</div>
				</div>
			</div>
			<div className="mx-auto flex w-full max-w-[660px] flex-col gap-4 px-4 py-8 md:py-12">
				{category?.name ? (
					<SiteLink href={`/${category.slug}/`} className="cursor-pointer self-start rounded-full bg-macro-red px-2.5 py-1 text-[11px]/[14px] font-bold uppercase tracking-[0.88px] text-white transition hover:opacity-90">
						{category.name}
					</SiteLink>
				) : null}
				{article.image ? (
					<div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-charcoal">
						<Image src={article.image.url} alt={article.image.alt || article.title} fill priority sizes="(min-width: 676px) 628px, 100vw" className="object-cover" />
					</div>
				) : null}
				<h1 className="font-display text-2xl/8 font-extrabold text-[#171717] text-balance">{article.title}</h1>
				{article.excerpt ? <p className="text-sm/[22px] text-[#171717]">{article.excerpt}</p> : null}
				{article.author.name || date || article.readingTime ? (
					<div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-t border-[#e5e5e5] pt-3 text-[11px]/4 text-[#737373]">
						<div className="flex flex-col gap-0.5">
							{article.author.name ? <p className="text-[13px]/[18px] font-semibold text-[#171717]">{labels.by.replace("{name}", article.author.name)}</p> : null}
							{article.location ? <p>{article.location}</p> : null}
						</div>
						<p className="flex flex-wrap items-center gap-x-2 gap-y-1">
							{article.readingTime ? (
								<span className="inline-flex items-center gap-1">
									<ClockIcon />
									{modules.news.readingTime.replace("{n}", String(article.readingTime))}
								</span>
							) : null}
							{article.readingTime && date ? <span aria-hidden="true">·</span> : null}
							{date ? <time dateTime={article.publishedAt}>{date}</time> : null}
						</p>
					</div>
				) : null}
				<div className="xl:hidden">
					<ShareBar url={url} title={article.title} labels={labels.share} />
				</div>
				<Summary items={article.summary} title={labels.summary} />
				{article.blocks.map(renderBlock)}
				{article.tags.length > 0 ? (
					<div className="flex flex-col gap-3 border-t border-[#e5e5e5] pb-4 pt-6">
						<p className="text-[11px]/4 font-semibold uppercase tracking-[1.1px] text-[#737373]">{labels.tags}</p>
						<ul className="flex flex-wrap gap-2">
							{article.tags.map((tag) => (
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
