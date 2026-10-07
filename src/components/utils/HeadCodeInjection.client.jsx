"use client";

import { useEffect } from "react";

function getScriptKey(script, index) {
	return String(script?.id || script?.name || index);
}

function copyAttributes(source, target) {
	for (const attribute of source.attributes) {
		target.setAttribute(attribute.name, attribute.value);
	}
}

function createExecutableNode(node) {
	if (node.nodeType !== Node.ELEMENT_NODE) {
		return node.cloneNode(true);
	}

	if (node.tagName.toLowerCase() !== "script") {
		return node.cloneNode(true);
	}

	const script = document.createElement("script");
	copyAttributes(node, script);
	script.text = node.textContent || "";

	return script;
}

function createHeadNodes({ code, key }) {
	const template = document.createElement("template");
	template.innerHTML = String(code || "").trim();

	return Array.from(template.content.childNodes).map((node) => {
		const nextNode = createExecutableNode(node);

		if (nextNode.nodeType === Node.ELEMENT_NODE) {
			nextNode.setAttribute("data-cms-head-injection", key);
		}

		return nextNode;
	});
}

export default function HeadCodeInjection({ scripts = [] }) {
	useEffect(() => {
		const insertedNodes = [];

		scripts.forEach((script, index) => {
			const key = getScriptKey(script, index);
			const nodes = createHeadNodes({ code: script?.code, key });

			nodes.forEach((node) => {
				document.head.appendChild(node);
				insertedNodes.push(node);
			});
		});

		return () => {
			insertedNodes.forEach((node) => {
				node.parentNode?.removeChild(node);
			});
		};
	}, [scripts]);

	return null;
}
