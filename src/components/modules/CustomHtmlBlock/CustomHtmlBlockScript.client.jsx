"use client";

import { useEffect } from "react";

export default function CustomHtmlBlockScript({ enabled, code, scopeId }) {
	useEffect(() => {
		if (!enabled || typeof code !== "string" || !code.trim()) {
			return undefined;
		}

		const script = document.createElement("script");
		script.type = "text/javascript";
		script.text = code;

		if (scopeId) {
			script.dataset.customHtmlBlockScope = scopeId;
		}

		document.body.appendChild(script);

		return () => {
			script.parentNode?.removeChild(script);
		};
	}, [code, enabled, scopeId]);

	return null;
}
