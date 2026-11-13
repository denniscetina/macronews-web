/**
 * "Resumen en 30 segundos" (Figma `Single Post`): a white card with a burgundy line on its left, a bolt icon and the title in
 * burgundy capitals, and the bullets (Inter 14/22). Painted only when the CMS sends bullets (`[]` in production for now).
 * @param {{ items: string[], title: string }} props
 */
export default function Summary({ items, title }) {
	if (items.length === 0) {
		return null;
	}
	return (
		<section aria-label={title} className="flex flex-col gap-3 rounded-lg border-l-[3px] border-burgundy bg-white px-5 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
			<h2 className="flex items-center gap-2 text-[11px]/4 font-bold uppercase tracking-[0.55px] text-burgundy">
				<svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
				</svg>
				{title}
			</h2>
			<ul className="list-disc space-y-1.5 pl-5 text-sm/[22px] text-[#262626] marker:text-[#262626]">
				{items.map((item) => (
					<li key={item}>{item}</li>
				))}
			</ul>
		</section>
	);
}
