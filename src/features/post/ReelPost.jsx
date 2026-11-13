import SiteLink from "@/components/ui/SiteLink";
import { mapReelItem } from "@/server/cms/mappers/sections";

/**
 * Template of a news whose format is `reel` (core: the post carries its reel payload). Reels have no page of their own in the
 * design (they open in the Reel Mode gallery), so this is only what a direct visit to the address shows: the vertical video
 * (an own file, or the YouTube / Vimeo player), the caption and the link to the related news. Provisional.
 * @param {{ article: ReturnType<typeof import("@/server/cms/mappers/article").mapArticle>, labels: Record<string, string> }} props
 */
export default function ReelPost({ article, labels }) {
	const reel = mapReelItem({ ...article.reel, title: article.title });
	const { video } = reel;
	const embed = video.embedUrl && /^https:\/\/(www\.youtube-nocookie\.com|www\.youtube\.com|player\.vimeo\.com)\//.test(video.embedUrl) ? video.embedUrl : null;
	return (
		<article className="bg-[#fafafa]">
			<div className="mx-auto flex w-full max-w-[420px] flex-col gap-4 px-4 py-8 md:py-12">
				<h1 className="font-display text-2xl/8 font-extrabold text-[#171717] text-balance">{article.title}</h1>
				<div className="aspect-[9/16] w-full overflow-hidden rounded-2xl bg-black">
					{video.src ? (
						<video src={video.src} poster={reel.poster?.url} controls playsInline preload="metadata" className="size-full object-contain" />
					) : embed ? (
						<iframe src={embed} title={article.title} loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="size-full border-0" />
					) : null}
				</div>
				{reel.caption ? <p className="text-sm/[22px] text-[#404040]">{reel.caption}</p> : null}
				{reel.relatedPost ? (
					<SiteLink href={reel.relatedPost.url} className="cursor-pointer text-sm/5 font-bold text-primary underline underline-offset-2">
						{labels.readRelated}: {reel.relatedPost.title}
					</SiteLink>
				) : null}
			</div>
		</article>
	);
}
