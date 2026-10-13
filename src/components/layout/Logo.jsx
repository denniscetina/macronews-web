import Link from "next/link";
import CmsImage from "@/components/ui/CmsImage";
import { localizePath } from "@/i18n";

/**
 * Eye icon (CMS logo) + MACRONEWS wordmark as text, as in the design.
 * On the red header and the black footer the icon must be the white version: upload it as
 * `logoDark` in CMS > Brand. Until then the color logo sits on a white circle.
 * @param {{ lang: string, name: string, logo: any, logoOnDark?: any, className?: string }} props
 */
export default function Logo({ lang, name, logo, logoOnDark, className = "" }) {
	const icon = logoOnDark ?? logo;
	const iconSize = 40;
	return (
		<Link href={localizePath(lang)} className={`inline-flex items-center gap-2 text-white ${className}`}>
			{icon ? (
				<CmsImage
					image={icon}
					height={iconSize}
					width={iconSize}
					alt=""
					priority
					className={`size-8 object-contain sm:size-10 ${logoOnDark ? "" : "rounded-full bg-white p-0.5"}`}
				/>
			) : null}
			<span className="font-brand text-2xl font-bold sm:text-[2rem] uppercase leading-none tracking-[-0.075em]">{name}</span>
		</Link>
	);
}
