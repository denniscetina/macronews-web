/**
 * `Quote` block (Figma `Single Post`): italic text (Inter 14/22) behind a light gray line, with the author in capitals in
 * burgundy under it ("— CLAUDIA SHEINBAUM, PRESIDENTA DE MÉXICO"). The measures come from the 100% captures of the design.
 * @param {{ data: { title: string, text: string, author: string, authorRole: string } }} props
 */
export default function Quote({ data }) {
	return (
		<figure className="flex flex-col gap-2 border-l-[3px] border-[#d4d4d4] bg-[#f5f5f5]/60 py-2 pl-4 pr-2">
			{data.title ? <p className="text-[11px]/4 font-bold uppercase tracking-[0.55px] text-[#171717]">{data.title}</p> : null}
			<blockquote className="whitespace-pre-line text-sm/[22px] italic text-[#525252]">{/^["“«]/.test(data.text) ? data.text : `“${data.text}”`}</blockquote>
			{data.author ? (
				<figcaption className="text-[10px]/4 font-bold uppercase tracking-[0.5px] text-burgundy">
					— {data.author}
					{data.authorRole ? `, ${data.authorRole}` : ""}
				</figcaption>
			) : null}
		</figure>
	);
}
