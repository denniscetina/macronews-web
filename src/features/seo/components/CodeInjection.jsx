/**
 * Renders CMS `bodyStart` / `bodyEnd` scripts in the server HTML.
 * @param {{ position: "bodyStart" | "bodyEnd", scripts: Array<{ id?: any, name?: string, code?: string }> }} props
 */
export default function CodeInjection({ position, scripts }) {
	return scripts.map((script, index) => (
		<div
			key={script.id ?? script.name ?? `${position}-${index}`}
			data-cms-code-injection={position}
			dangerouslySetInnerHTML={{ __html: String(script.code).trim() }}
		/>
	));
}
