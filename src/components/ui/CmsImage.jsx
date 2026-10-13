import Image from "next/image";

/**
 * Renders a mapped CMS image (see `mapImage`). Returns nothing without an image.
 * Needs width/height from the CMS to avoid layout shift; falls back to the given ones.
 * @param {{ image: ReturnType<typeof import("@/server/cms/mappers/media").mapImage>, width?: number, height?: number } & Record<string, any>} props
 */
export default function CmsImage({ image, width, height, alt, ...props }) {
	if (!image) {
		return null;
	}
	const w = width ?? image.width ?? 0;
	const h = height ?? image.height ?? 0;
	if (!w || !h) {
		// eslint-disable-next-line @next/next/no-img-element
		return <img src={image.url} alt={alt ?? image.alt} {...props} />;
	}
	return <Image src={image.url} alt={alt ?? image.alt} width={w} height={h} {...props} />;
}
