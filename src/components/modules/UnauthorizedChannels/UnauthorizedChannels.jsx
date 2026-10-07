const addClassesToTag = ({ html, tagName, classes, firstOnly = false }) => {
	const matcher = new RegExp(`<${tagName}([^>]*)>`, firstOnly ? "i" : "gi");

	return html.replace(matcher, (match, attrs) => {
		if (/\bclass\s*=/.test(attrs)) {
			return `<${tagName}${attrs.replace(
				/\bclass\s*=\s*(["'])(.*?)\1/i,
				(_m, quote, current) => ` class=${quote}${current} ${classes}${quote}`,
			)}>`;
		}

		return `<${tagName}${attrs} class="${classes}">`;
	});
};

export default function UnauthorizedChannels({ data }) {
	const { title, unauthorizedChannelsList } = data;

	const rawHtml = unauthorizedChannelsList || "";
	const listItemsCount = (rawHtml.match(/<li\b/gi) || []).length;

	const columnsClass =
		listItemsCount <= 4
			? "grid-cols-1"
			: listItemsCount <= 8
				? "grid-cols-1 md:grid-cols-2"
				: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";

	const listClass = `grid lg:gap-x-[15rem] gap-y-4 list-none p-0 m-0 ${columnsClass}`;
	const itemClass = "flex items-center gap-2 w-[160px] before:content-['›'] before:shrink-0";

	const htmlWithStyledList = addClassesToTag({
		html: rawHtml,
		tagName: "ul",
		classes: listClass,
		firstOnly: true,
	});

	const styledHtml = addClassesToTag({
		html: htmlWithStyledList,
		tagName: "li",
		classes: itemClass,
	});

	return (
		<section
			data-component="UnauthorizedChannels"
			className="relative overflow-visible w-full h-auto bg-alt py-16 px-8 lg:py-[128px] min-h-[252px]">
			<div className="flex flex-col items-center text-center px-8">
				<h4 className="ext-secondary font-glosa font-medium text-2xl md:text-3xl lg:text-4xl leading-tight capitalize pb-8">
					{title}
				</h4>
				<div
					className="wysiwyg flex justify-center w-full max-w-7xl"
					dangerouslySetInnerHTML={{ __html: styledHtml }}
				/>
			</div>
		</section>
	);
}
