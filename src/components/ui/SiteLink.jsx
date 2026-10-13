import Link from "next/link";

/**
 * Link for CMS-driven hrefs: internal -> next/link, external -> <a> (new tab for http/https).
 * Without href (placeholder menu items) it renders a plain <span>.
 * @param {{ href: string | null, external?: boolean, children: React.ReactNode } & Record<string, any>} props
 */
export default function SiteLink({ href, external = false, children, ...props }) {
	if (!href) {
		return <span {...props}>{children}</span>;
	}
	if (external) {
		const isWeb = /^https?:/i.test(href);
		return (
			<a href={href} {...(isWeb ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...props}>
				{children}
			</a>
		);
	}
	return (
		<Link href={href} {...props}>
			{children}
		</Link>
	);
}
