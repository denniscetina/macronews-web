/**
 * An ad piece at its natural size (no crops: the arts are designed per format), with the "Publicidad" label, its `alt` and
 * the link only when the campaign has one (`rel="sponsored noopener"`, a new tab only when the CMS says so).
 * A plain `<img>` on purpose: `next/image` would turn an animated GIF into a still frame.
 * @param {{ piece: import("@/lib/ads/select").AdPiece, label: string, className?: string }} props
 */
export default function AdPiece({ piece, label, className = "" }) {
	const { image } = piece;
	const picture = (
		// eslint-disable-next-line @next/next/no-img-element
		<img src={image.url} alt={piece.alt} width={image.width} height={image.height} loading="lazy" decoding="async" style={{ aspectRatio: `${image.width} / ${image.height}`, maxWidth: image.width }} className="mx-auto block h-auto w-full" />
	);
	return (
		<aside aria-label={label} className={`flex flex-col gap-1 ${className}`}>
			<p className="text-[10px]/4 font-medium uppercase tracking-[0.5px] text-[#737373]">{label}</p>
			{piece.href ? (
				<a href={piece.href} rel="sponsored noopener" {...(piece.newTab ? { target: "_blank" } : {})} className="cursor-pointer">
					{picture}
				</a>
			) : (
				picture
			)}
		</aside>
	);
}
