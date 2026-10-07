import { getImageProps } from "next/image";

const DEFAULT_DESKTOP_WIDTH = 1600;
const DEFAULT_DESKTOP_HEIGHT = 1068;
const DEFAULT_TABLET_WIDTH = 1200;
const DEFAULT_TABLET_HEIGHT = 900;
const DEFAULT_MOBILE_WIDTH = 768;
const DEFAULT_MOBILE_HEIGHT = 1024;

export const isValidImage = (image) =>
	Boolean(image && typeof image.url === "string" && image.url.trim());

export const toPositiveNumber = (value, fallbackValue) => {
	const parsedValue = Number(value);
	return Number.isFinite(parsedValue) && parsedValue > 0
		? parsedValue
		: fallbackValue;
};

export const resolveHeroImages = (backgroundImage = {}) => {
	const desktopCandidate = isValidImage(backgroundImage.desktopImage)
		? backgroundImage.desktopImage
		: null;
	const tabletCandidate = isValidImage(backgroundImage.tabletImage)
		? backgroundImage.tabletImage
		: null;
	const mobileCandidate = isValidImage(backgroundImage.mobileImage)
		? backgroundImage.mobileImage
		: null;

	const desktopImage = desktopCandidate || tabletCandidate || mobileCandidate;
	const tabletImage = tabletCandidate || desktopImage || mobileCandidate;
	const mobileImage = mobileCandidate || tabletImage || desktopImage;
	const fallbackImage = desktopImage || tabletImage || mobileImage;

	return {
		desktopImage,
		tabletImage,
		mobileImage,
		fallbackImage,
	};
};

export default function useHeroResponsivePicture(backgroundImage, options = {}) {
	const {
		title = "",
		sizes = "100vw",
		desktopQuality = 80,
		tabletQuality = 75,
		mobileQuality = 70,
	} = options;
	const { desktopImage, tabletImage, mobileImage, fallbackImage } =
		resolveHeroImages(backgroundImage);

	const heroAlt =
		fallbackImage?.alt || fallbackImage?.title || title || "Hero Background";

	const desktopDimensions = {
		width: toPositiveNumber(desktopImage?.width, DEFAULT_DESKTOP_WIDTH),
		height: toPositiveNumber(desktopImage?.height, DEFAULT_DESKTOP_HEIGHT),
	};
	const tabletDimensions = {
		width: toPositiveNumber(tabletImage?.width, DEFAULT_TABLET_WIDTH),
		height: toPositiveNumber(tabletImage?.height, DEFAULT_TABLET_HEIGHT),
	};
	const mobileDimensions = {
		width: toPositiveNumber(mobileImage?.width, DEFAULT_MOBILE_WIDTH),
		height: toPositiveNumber(mobileImage?.height, DEFAULT_MOBILE_HEIGHT),
	};

	const commonImageProps = {
		alt: heroAlt,
		sizes,
	};

	let desktopSrcSet = "";
	let tabletSrcSet = "";
	let mobileSrcSet = "";
	let mobileSrc = "";
	let imgProps = {};

	if (fallbackImage?.url) {
		({
			props: { srcSet: desktopSrcSet },
		} = getImageProps({
			...commonImageProps,
			src: desktopImage?.url || fallbackImage.url,
			...desktopDimensions,
			quality: desktopQuality,
		}));

		({
			props: { srcSet: tabletSrcSet },
		} = getImageProps({
			...commonImageProps,
			src: tabletImage?.url || fallbackImage.url,
			...tabletDimensions,
			quality: tabletQuality,
		}));

		({
			props: { srcSet: mobileSrcSet, src: mobileSrc, ...imgProps },
		} = getImageProps({
			...commonImageProps,
			src: mobileImage?.url || fallbackImage.url,
			...mobileDimensions,
			quality: mobileQuality,
		}));
	}

	return {
		desktopSrcSet,
		tabletSrcSet,
		mobileSrcSet,
		mobileSrc,
		imgProps,
		heroAlt,
		fallbackImage,
	};
}
