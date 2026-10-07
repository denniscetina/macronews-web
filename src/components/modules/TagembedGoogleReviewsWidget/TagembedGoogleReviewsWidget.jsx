"use client";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import TagembedSkeleton from "./TagembedSkeleton";

TagembedGoogleReviewsWidget.propTypes = {
	data: PropTypes.object,
};

const TAGEMBED_SCRIPT_ID = "tagembed-script";
const TAGEMBED_SRC = "https://widget.tagembed.com/embed.min.js";

export default function TagembedGoogleReviewsWidget({ data }) {
	const { widgetId, title } = data || {};
	const widgetRef = useRef(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!widgetId || !widgetRef.current) return;

		const initWidget = () => {
			window.tagembed?.loadWidgets?.();

			const observer = new MutationObserver(() => {
				const widget = widgetRef.current;
				if (!widget) return;

				const hasContent =
					widget.innerHTML.includes("iframe") ||
					widget.innerHTML.includes("tagembed") ||
					widget.offsetHeight > 50;

				if (hasContent) {
					setTimeout(() => {
						setLoading(false);
						observer.disconnect();
					}, 100);
				}
			});

			observer.observe(widgetRef.current, {
				childList: true,
				subtree: true,
				attributes: true,
			});
		};

		const existingScript = document.getElementById(TAGEMBED_SCRIPT_ID);

		if (!existingScript) {
			const script = document.createElement("script");
			script.id = TAGEMBED_SCRIPT_ID;
			script.src = TAGEMBED_SRC;
			script.async = true;
			script.onload = initWidget;
			document.body.appendChild(script);
		} else {
			initWidget();
		}
	}, [widgetId]);

	if (!widgetId) return null;

	return (
		<section data-component="TagembedGoogleReviewsWidget" className="relative w-full bg-alt py-8 px-8 min-h-[252px]">
			<div className="flex flex-col items-center text-center px-8">
				{title && (
					<h4 className="text-secondary font-glosa font-medium text-2xl md:text-3xl lg:text-4xl leading-tight capitalize px-8 pb-16">
						{title}
					</h4>
				)}

				{loading && <TagembedSkeleton />}

				<div
					ref={widgetRef}
					className={`tagembed-widget relative top-0 transition-transform duration-500
            ${loading ? "-translate-x-[5000px]" : "translate-x-0"}`}
					style={{ width: "75%", height: "100%", overflow: "auto" }}
					data-widget-id={widgetId}
					data-website="1"
				/>
			</div>
		</section>
	);
}
