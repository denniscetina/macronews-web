/**
 * Example module: renders CMS HTML. The HTML must be sanitized before it is stored/served.
 * @param {{ data: { html?: string } }} props
 */
export default function RichText({ data }) {
	return <section className="prose mx-auto max-w-3xl px-4 py-8" dangerouslySetInnerHTML={{ __html: data?.html ?? "" }} />;
}
