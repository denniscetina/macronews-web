import SiteLink from "@/components/ui/SiteLink";

/** 16px glyphs (Figma footer icons, #A3A3A3). The CMS `key` is a fixed list, the icon is picked by it. */
const ICONS = {
	facebook: <path d="M9.5 16v-6h2l.4-2.5H9.5V6c0-.8.3-1.3 1.4-1.3H12V2.5C11.7 2.5 11 2.4 10.2 2.4 8.3 2.4 7 3.6 7 5.6v1.9H5V10h2v6h2.5Z" transform="scale(.9)" />,
	instagram: (
		<>
			<rect x="2" y="2" width="12" height="12" rx="3.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
			<circle cx="8" cy="8" r="2.7" fill="none" stroke="currentColor" strokeWidth="1.4" />
			<circle cx="11.6" cy="4.4" r=".8" />
		</>
	),
	x: <path d="M12.2 2h2.1L9.7 7.2 15 14h-4.2L7.5 9.8 3.8 14H1.7l4.9-5.5L1.5 2h4.3l3 3.9L12.2 2Zm-.7 10.8h1.2L5 3.2H3.7l7.8 9.6Z" />,
	tiktok: <path d="M9 1.5h2.1c.2 1.5 1.1 2.5 2.9 2.6v2.1c-1.1 0-2-.3-2.8-.9v4.4c0 2.4-1.8 4.1-4.1 4.1S2.9 12 2.9 9.7c0-2.3 1.9-4.2 4.5-4v2.2c-1.3-.2-2.2.7-2.2 1.8 0 1 .8 1.9 1.9 1.9s1.9-.7 1.9-2V1.5Z" />,
	youtube: <path d="M14.6 4.6c-.2-.7-.7-1.2-1.4-1.4C12 2.9 8 2.9 8 2.9s-4 0-5.2.3c-.7.2-1.2.7-1.4 1.4C1.1 5.8 1.1 8 1.1 8s0 2.2.3 3.4c.2.7.7 1.2 1.4 1.4 1.2.3 5.2.3 5.2.3s4 0 5.2-.3c.7-.2 1.2-.7 1.4-1.4.3-1.2.3-3.4.3-3.4s0-2.2-.3-3.4ZM6.5 10.2V5.8L10.3 8l-3.8 2.2Z" />,
	linkedin: <path d="M3.6 6h-2v8.4h2V6ZM2.6 2.4a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4ZM14.9 14.4V9.8c0-2.2-1.2-3.9-3.2-3.9-1.1 0-1.7.6-2 1V6H7.8v8.4h2V10c0-1 .5-1.8 1.5-1.8 1 0 1.5.7 1.5 1.8v4.4h2.1Z" />,
	threads: <path d="M11.6 7.4c-.1-2-1.2-3.1-3-3.1-1.1 0-2.1.5-2.6 1.4l1.1.7c.3-.5.9-.8 1.5-.8 1 0 1.6.6 1.7 1.7-.5-.1-1-.1-1.5-.1-1.8 0-3 .9-3 2.3 0 1.3 1.1 2.2 2.6 2.2 1.9 0 3.1-1.1 3.2-3.1 0 0 0-.1 0-1.2Zm-3.2 3c-.8 0-1.3-.4-1.3-1 0-.6.6-1 1.6-1 .4 0 .8 0 1.2.1-.1 1.2-.7 1.9-1.5 1.9ZM8 1.5c-3.6 0-6 2.4-6 6.5s2.4 6.5 6 6.5c2.5 0 4.2-1 5.1-2.7l-1.1-.6c-.7 1.3-2 2-4 2-2.9 0-4.6-1.9-4.6-5.2s1.8-5.2 4.6-5.2c2.7 0 4.2 1.5 4.5 3.5l1.2-.3C13.3 3.2 11.5 1.5 8 1.5Z" />,
	whatsapp: <path d="M8 1.4a6.5 6.5 0 0 0-5.6 9.8L1.4 14.6l3.5-.9A6.5 6.5 0 1 0 8 1.4Zm3.5 9.1c-.1.4-.8.8-1.1.8-.3 0-.7.2-2.3-.5-1.9-.8-3-2.7-3.1-2.8-.1-.1-.7-.9-.7-1.8s.5-1.3.6-1.5c.2-.2.4-.2.5-.2h.4c.1 0 .3 0 .4.3l.6 1.4c0 .1.1.2 0 .3l-.2.3-.3.3c-.1.1-.2.2-.1.4.1.2.6 1 1.3 1.6.9.8 1.6 1 1.8 1.1.2.1.3.1.4-.1l.6-.7c.1-.2.3-.1.4-.1l1.3.6c.2.1.3.1.4.2 0 .1 0 .5-.1.9Z" />,
	telegram: <path d="M14.4 2.3 1.6 7.2c-.9.4-.9.9-.2 1.1l3.3 1 1.3 4c.2.5.1.7.6.7.4 0 .6-.2.8-.4l1.6-1.6 3.3 2.4c.6.3 1 .2 1.2-.6l2-9.5c.2-.9-.3-1.3-1.1-1Zm-8 6.4 6.3-4c.3-.2.6-.1.4.1L7.5 9.5l-.2 2.2-.9-3Z" />,
};

/**
 * Social networks as icons (16px) with the network name as the accessible label.
 * @param {{ items: Array<{ key: string, label: string, url: string }>, className?: string }} props
 */
export default function SocialLinks({ items, className = "" }) {
	if (items.length === 0) {
		return null;
	}
	return (
		<ul className={`flex flex-wrap items-center gap-4 ${className}`}>
			{items.map((item) => {
				const icon = ICONS[item.key];
				return (
					<li key={item.key || item.url}>
						<SiteLink href={item.url} external aria-label={item.label || item.key} className="flex size-4 items-center justify-center text-gray transition-colors hover:text-white">
							{icon ? (
								<svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 fill-current">
									{icon}
								</svg>
							) : (
								<span className="text-xs">{item.label || item.key}</span>
							)}
						</SiteLink>
					</li>
				);
			})}
		</ul>
	);
}
