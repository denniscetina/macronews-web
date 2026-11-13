import Image from "next/image";

/** Players the core allows in a `Media` video (the same hosts `clean-html` lets through). */
const PLAYER_HOSTS = ["www.youtube-nocookie.com", "www.youtube.com", "player.vimeo.com"];

function playerUrl(embedUrl) {
	try {
		const url = new URL(embedUrl);
		return url.protocol === "https:" && PLAYER_HOSTS.includes(url.hostname) ? url.toString() : null;
	} catch {
		return null;
	}
}

function Picture({ image, className }) {
	const { url, alt, width, height } = image;
	return <Image src={url} alt={alt} width={width ?? 1600} height={height ?? 900} sizes="(min-width: 676px) 628px, 100vw" className={className} />;
}

/**
 * `Media` block: a photo (with its own mobile version when the CMS sends one) or a video (an own file, or a YouTube / Vimeo
 * player), with its caption and credit under it. Not in the Figma `Single Post`: provisional, in the article's style.
 * @param {{ data: { mediaType: "image" | "video", image: { desktop: any, mobile: any }, video: any, caption: string, credit: string } }} props
 */
export default function Media({ data }) {
	const { image, video } = data;
	const embed = video?.embedUrl ? playerUrl(video.embedUrl) : null;
	const hasMobile = image.mobile && image.desktop && image.mobile.url !== image.desktop.url;
	return (
		<figure className="flex flex-col gap-2">
			{data.mediaType === "video" ? (
				video?.src ? (
					<video src={video.src} poster={video.poster?.url} controls preload="metadata" playsInline className="aspect-video w-full rounded-lg bg-black" />
				) : embed ? (
					<iframe src={embed} title={data.caption || "Video"} loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="aspect-video w-full rounded-lg border-0 bg-black" />
				) : null
			) : (
				<>
					<Picture image={image.desktop} className={`h-auto w-full rounded-lg ${hasMobile ? "hidden md:block" : ""}`} />
					{hasMobile ? <Picture image={image.mobile} className="h-auto w-full rounded-lg md:hidden" /> : null}
				</>
			)}
			{data.caption || data.credit ? (
				<figcaption className="text-xs/4 text-[#737373]">
					{data.caption}
					{data.caption && data.credit ? " " : ""}
					{data.credit ? <span className="font-medium">{data.credit}</span> : null}
				</figcaption>
			) : null}
		</figure>
	);
}
