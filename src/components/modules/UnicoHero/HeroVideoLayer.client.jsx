"use client";

import { useEffect, useState } from "react";
import useIsMobile from "@/hooks/useIsMobile";

const VIDEO_DEFER_MS = 1200;

function VideoIframe({ src, title = "Hero Video" }) {
	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
			<iframe
				id="hero-iframe-video"
				className="absolute top-1/2 left-1/2 w-[177.77vh] min-w-full h-[56.25vw] min-h-full -translate-x-1/2 -translate-y-1/2 border-0"
				src={src}
				title={title}
				allow="autoplay; fullscreen; picture-in-picture"
				allowFullScreen
				loading="lazy"
			/>
		</div>
	);
}

function VideoNative({ src, poster }) {
	return (
		<video
			className="absolute inset-0 w-full h-full object-cover"
			src={src}
			poster={poster}
			autoPlay
			preload="none"
			loop
			muted
			playsInline
		/>
	);
}

export default function HeroVideoLayer({
	videoSource,
	mobileVideoSource,
	poster,
	posterMobile,
}) {
	const [readyVideoKey, setReadyVideoKey] = useState("");
	const isMobile = useIsMobile();
	const selectedPoster = isMobile ? posterMobile : poster;
	const selectedVideoSource = isMobile
		? mobileVideoSource || videoSource
		: videoSource;
	const selectedVideoKey = selectedVideoSource?.url
		? `${selectedVideoSource.type}:${selectedVideoSource.url}`
		: "";

	useEffect(() => {
		if (!selectedVideoKey) {
			return undefined;
		}

		const timeoutId = window.setTimeout(() => {
			setReadyVideoKey(selectedVideoKey);
		}, VIDEO_DEFER_MS);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [selectedVideoKey]);

	if (!selectedVideoSource?.url || readyVideoKey !== selectedVideoKey) {
		return null;
	}

	if (selectedVideoSource.type === "iframe") {
		return <VideoIframe src={selectedVideoSource.url} />;
	}

	return <VideoNative src={selectedVideoSource.url} poster={selectedPoster} />;
}
