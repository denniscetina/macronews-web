const HIDE = { mobile: "max-md:hidden", tablet: "md:max-lg:hidden", desktop: "lg:hidden" };

/**
 * `CustomHtmlBlock`: the editor's HTML and CSS (the core validates and cleans the HTML on save and prefixes every CSS selector
 * with `#scopeId`, so the style only reaches this block). The container carries that `id`, the extra classes and, in a news, the
 * width of the text column (`contained`) or the whole width (`full_width`). It is hidden on the devices that are not in `visibleOn`.
 * The block's JavaScript (`script`) is NOT run: running code written in the CMS on every reader's browser is a security decision
 * that is pending with the team (see the README).
 * @param {{ data: ReturnType<typeof import("@/server/cms/mappers/article").mapArticleBlocks>[number]["data"] }} props
 */
export default function CustomHtml({ data }) {
	const Tag = data.htmlElement;
	const devices = data.visibleOn.includes("all") || data.visibleOn.length === 0 ? [] : Object.keys(HIDE).filter((device) => !data.visibleOn.includes(device));
	const wide = data.containerWidth === "full_width" ? "xl:-mx-[calc((100vw-628px)/2-1rem)]" : "";
	return (
		<>
			{data.css ? <style dangerouslySetInnerHTML={{ __html: data.css }} /> : null}
			<Tag id={data.scopeId} className={`${data.cssClasses} ${devices.map((device) => HIDE[device]).join(" ")} ${wide}`.trim() || undefined} dangerouslySetInnerHTML={{ __html: data.html }} />
		</>
	);
}
