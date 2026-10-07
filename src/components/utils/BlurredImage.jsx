import "server-only";
import Image from "next/image";
import { cache } from "react";
import { getPlaiceholder } from "plaiceholder";
import fs from "node:fs/promises";
import path from "node:path";

const FALLBACK_BLUR_DATA_URL =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mPcduVSPQAHgQLda8NbMgAAAABJRU5ErkJggg==";
const MEDIA_PROXY_PATH = "/media/";

const normalizeOrigin = (value) => {
	if (!value || typeof value !== "string") {
		return "";
	}

	const valueWithProtocol = /^https?:\/\//i.test(value)
		? value
		: `https://${value}`;

	try {
		return new URL(valueWithProtocol).origin;
	} catch {
		return "";
	}
};

const resolveSiteOrigin = () => {
	const configuredOrigin = normalizeOrigin(
		process.env.SITE_URL ||
			process.env.NEXT_PUBLIC_SITE_URL
	);

	if (configuredOrigin) {
		return configuredOrigin;
	}

	return "http://localhost:3000";
};

const stripQueryAndHash = (value) => value.split("#")[0].split("?")[0];
const isRemoteUrl = (value) => /^https?:\/\//i.test(value);

const fetchBuffer = async (resourceUrl) => {
	const response = await fetch(resourceUrl);

	if (!response.ok) {
		throw new Error(
			`Unable to fetch image resource (${response.status} ${response.statusText})`,
		);
	}

	return Buffer.from(await response.arrayBuffer());
};

const readLocalPublicFile = async (src) => {
	const relativePath = stripQueryAndHash(src).replace(/^\/+/, "");

	if (!relativePath || relativePath.includes("..")) {
		throw new Error("Invalid local image path.");
	}

	const absolutePath = path.join(process.cwd(), "public", relativePath);
	return fs.readFile(absolutePath);
};

const getBufferFromSource = async (rawSrc) => {
	if (isRemoteUrl(rawSrc)) {
		return fetchBuffer(rawSrc);
	}

	if (rawSrc.startsWith(MEDIA_PROXY_PATH)) {
		const mediaUrl = new URL(rawSrc, resolveSiteOrigin()).toString();
		return fetchBuffer(mediaUrl);
	}

	return readLocalPublicFile(rawSrc);
};

//Generates a blur data URL for an image
//Works with remote images and local images
const getBlurData = cache(async (src) => {
	if (typeof src !== "string" || !src.trim()) {
		return FALLBACK_BLUR_DATA_URL;
	}

	try {
		const buffer = await getBufferFromSource(src.trim());
		const { base64 } = await getPlaiceholder(buffer);
		return base64;
	} catch (err) {
		console.error(
			"Placeholder error en BlurredImage:",
			src,
			"-",
			err?.message || err,
		);
		return FALLBACK_BLUR_DATA_URL;
	}
});

export default async function BlurredImage({ src, alt = "", ...props }) {
	const blurDataURL = await getBlurData(src);

	return (
		<Image
			src={src}
			alt={alt}
			placeholder="blur"
			blurDataURL={blurDataURL}
			{...props}
		/>
	);
}