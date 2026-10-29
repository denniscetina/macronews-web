import Link from "next/link";
import CmsImage from "@/components/ui/CmsImage";
import { localizePath } from "@/i18n";

/** A logo wider than this (width / height) already includes the wordmark. */
const FULL_LOGO_RATIO = 2.5;

/**
 * Brand logo. The CMS (Brand > Logo claro) may hold the full logo, icon + MACRONEWS wordmark in one image
 * (the 633x96 one of the design, 422x64 in the header): then it is shown alone, with the height of the place
 * (`size`). If it is only the eye icon, the wordmark is written as text next to it, as in the design.
 * On the red header and the black footer the white version is needed (`logoDark` in the CMS when it exists).
 * @param {{ lang: string, name: string, logo: any, logoOnDark?: any, size?: "header" | "footer", className?: string }} props
 */
export default function Logo({ lang, name, logo, logoOnDark, size = "header", className = "" }) {
	const icon = logoOnDark ?? logo;
	const iconSize = 40;
	const full = icon?.width && icon?.height && icon.width / icon.height > FULL_LOGO_RATIO;

	if (full) {
		return (
			<Link href={localizePath(lang)} aria-label={name} className={`inline-flex items-center ${className}`}>
				<CmsImage image={icon} alt={name} priority className={`w-auto ${size === "footer" ? "h-9" : "h-8 sm:h-10"}`} />
			</Link>
		);
	}

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
