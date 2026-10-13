import SiteLink from "@/components/ui/SiteLink";

/**
 * Social networks as text links. Icons come later (the CMS only provides label, key and url).
 * @param {{ items: Array<{ key: string, label: string, url: string }>, className?: string }} props
 */
export default function SocialLinks({ items, className = "" }) {
	if (items.length === 0) {
		return null;
	}
	return (
		<ul className={`flex flex-wrap items-center gap-4 ${className}`}>
			{items.map((item) => (
				<li key={item.key || item.url}>
					<SiteLink href={item.url} external className="hover:text-white">
						{item.label || item.key}
					</SiteLink>
				</li>
			))}
		</ul>
	);
}
