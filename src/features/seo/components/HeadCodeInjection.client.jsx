"use client";

import { useEffect } from "react";

/** Scripts inserted through innerHTML never run: rebuild them as real <script> elements. */
function toExecutable(node) {
	if (node.nodeType !== Node.ELEMENT_NODE || node.tagName.toLowerCase() !== "script") {
		return node.cloneNode(true);
	}
	const script = document.createElement("script");
	for (const { name, value } of node.attributes) {
		script.setAttribute(name, value);
	}
	script.text = node.textContent ?? "";
	return script;
}

/** Adds the CMS head scripts (GTM, pixels...) to <head> on the client and removes them on unmount. */
export default function HeadCodeInjection({ scripts }) {
	useEffect(() => {
		const inserted = [];
		scripts.forEach((script, index) => {
			const key = String(script.id ?? script.name ?? index);
			const template = document.createElement("template");
			template.innerHTML = String(script.code ?? "").trim();
			for (const child of template.content.childNodes) {
				const node = toExecutable(child);
				node.setAttribute?.("data-cms-head-injection", key);
				document.head.appendChild(node);
				inserted.push(node);
			}
		});
		return () => inserted.forEach((node) => node.parentNode?.removeChild(node));
	}, [scripts]);

	return null;
}
