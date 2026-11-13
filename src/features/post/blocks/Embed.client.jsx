"use client";

import { useEffect, useRef } from "react";

/** Official widget script of each network, loaded once and only when the post is about to be seen. */
const SCRIPTS = {
	x: { src: "https://platform.twitter.com/widgets.js", init: () => window.twttr?.widgets?.load() },
	instagram: { src: "https://www.instagram.com/embed.js", init: () => window.instgrm?.Embeds?.process() },
	tiktok: { src: "https://www.tiktok.com/embed.js", init: () => undefined },
};
const loading = {};

function loadScript(src) {
	loading[src] ??= new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = src;
		script.async = true;
		script.onload = resolve;
		script.onerror = reject;
		document.body.appendChild(script);
	});
	return loading[src];
}

/** Address of a YouTube / Vimeo player from the post link, or null when the link is not a video we know. */
function playerFor(provider, link) {
	try {
		const url = new URL(link);
		if (provider === "youtube") {
			const id = url.hostname === "youtu.be" ? url.pathname.slice(1) : url.searchParams.get("v") || url.pathname.match(/\/(?:shorts|live|embed)\/([\w-]+)/)?.[1];
			return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null;
		}
		const id = url.pathname.match(/(\d{5,})/)?.[1];
		return id ? `https://player.vimeo.com/video/${id}` : null;
	} catch {
		return null;
	}
}

/**
 * `Embed` block: a post of X, Instagram, TikTok or Facebook, or a YouTube / Vimeo video, from its public link. YouTube and Vimeo use
 * their player; Facebook its post plugin; X, Instagram and TikTok their official widget, loaded lazily when the block gets near the
 * screen (their scripts are third party and the core does not send their HTML). The link stays under the post as the fallback.
 * @param {{ data: { provider: string, url: string, caption: string }, labels: Record<string, string> }} props
 */
export default function Embed({ data, labels }) {
	const { provider, url } = data;
	const ref = useRef(null);
	const script = SCRIPTS[provider];
	useEffect(() => {
		const element = ref.current;
		if (!script || !element || !("IntersectionObserver" in window)) {
			return undefined;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					observer.disconnect();
					loadScript(script.src).then(script.init).catch(() => {});
				}
			},
			{ rootMargin: "400px" },
		);
		observer.observe(element);
		return () => observer.disconnect();
	}, [script]);

	const player = provider === "youtube" || provider === "vimeo" ? playerFor(provider, url) : null;
	let widget = null;
	if (player) {
		widget = <iframe src={player} title={data.caption || labels.embed} loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="aspect-video w-full rounded-lg border-0 bg-black" />;
	} else if (provider === "facebook") {
		widget = <iframe src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&width=500&show_text=true`} title={data.caption || labels.embed} loading="lazy" allow="encrypted-media; fullscreen" className="mx-auto h-[560px] w-full max-w-[500px] border-0" />;
	} else if (provider === "x") {
		widget = (
			<blockquote className="twitter-tweet" data-dnt="true">
				<a href={url}>{labels.view}</a>
			</blockquote>
		);
	} else if (provider === "instagram") {
		widget = <blockquote className="instagram-media mx-auto w-full max-w-[540px]" data-instgrm-permalink={url} data-instgrm-version="14" />;
	} else if (provider === "tiktok") {
		widget = (
			<blockquote className="tiktok-embed mx-auto" cite={url} data-video-id={url.match(/video\/(\d+)/)?.[1]}>
				<section />
			</blockquote>
		);
	}
	return (
		<figure ref={ref} className="flex flex-col gap-2">
			{widget}
			<figcaption className="flex flex-col gap-1 text-xs/4 text-[#737373]">
				{data.caption ? <span>{data.caption}</span> : null}
				<a href={url} target="_blank" rel="noopener noreferrer" className="cursor-pointer font-medium text-primary underline underline-offset-2">
					{labels.view}
				</a>
			</figcaption>
		</figure>
	);
}
