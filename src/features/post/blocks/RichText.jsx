import { cleanHtml } from "@/server/content/clean-html";

/** `RichText` block: the editor's HTML (also the whole body of a `legacy` news), cleaned and set with the article typography. */
export default function RichText({ data, origins }) {
	return <div className="article-content" dangerouslySetInnerHTML={{ __html: cleanHtml(data.html, origins) }} />;
}
