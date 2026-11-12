import SiteLink from "@/components/ui/SiteLink";

/**
 * Topics of the carousel (core `topics`: the tags of its news, most used first, each linking to its tag archive). The core leaves
 * the position and style to design: provisional chips under the heading. The tag archive page does not exist yet, so the links
 * lead to a 404 until it does.
 * @param {{ topics: { id: number, name: string, url: string }[], label: string, dark?: boolean }} props
 */
export default function Topics({ topics, label, dark = false }) {
	if (topics.length === 0) {
		return null;
	}
	return (
		<ul aria-label={label} className="mb-6 flex flex-wrap gap-2">
			{topics.map((topic) => (
				<li key={topic.id}>
					<SiteLink
						href={topic.url}
						className={`inline-block cursor-pointer rounded-full px-3.5 py-1.5 text-xs/4 transition ${dark ? "bg-white/10 text-white hover:bg-white/20" : "bg-[#a3a3a3]/20 text-black hover:bg-[#a3a3a3]/35"}`}
					>
						{topic.name}
					</SiteLink>
				</li>
			))}
		</ul>
	);
}
