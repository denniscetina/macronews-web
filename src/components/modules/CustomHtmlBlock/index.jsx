import clsx from "clsx";
import { createElement } from "react";
import { getSpacingProps } from "@/lib/getSpacingProps";
import CustomHtmlBlockScript from "@/components/modules/CustomHtmlBlock/CustomHtmlBlockScript.client";

const ALLOWED_HTML_ELEMENTS = new Set(["section", "div", "article", "aside"]);
const DEFAULT_HTML_ELEMENT = "section";

function resolveHtmlElement(value) {
	const tagName = String(value || "")
		.trim()
		.toLowerCase();

	return ALLOWED_HTML_ELEMENTS.has(tagName) ? tagName : DEFAULT_HTML_ELEMENT;
}

function normalizeVisibleOn(value) {
	if (!Array.isArray(value)) {
		return ["all"];
	}

	const devices = value
		.map((item) =>
			String(item || "")
				.trim()
				.toLowerCase(),
		)
		.filter(Boolean);

	return devices.length > 0 ? Array.from(new Set(devices)) : ["all"];
}

function getVisibilityClassName(visibleOn) {
	const devices = normalizeVisibleOn(visibleOn);

	if (devices.includes("all")) {
		return "";
	}

	const hasMobile = devices.includes("mobile");
	const hasTablet = devices.includes("tablet");
	const hasDesktop = devices.includes("desktop");

	if (hasMobile && hasTablet && hasDesktop) {
		return "";
	}

	if (hasMobile && hasTablet) {
		return "lg:hidden";
	}

	if (hasTablet && hasDesktop) {
		return "hidden md:block";
	}

	if (hasMobile && hasDesktop) {
		return "block md:hidden lg:block";
	}

	if (hasMobile) {
		return "md:hidden";
	}

	if (hasTablet) {
		return "hidden md:block lg:hidden";
	}

	if (hasDesktop) {
		return "hidden lg:block";
	}

	return "";
}

export default function CustomHtmlBlock({ data = {} }) {
	if (data?.enabled === false) {
		return null;
	}

	const { layout = {} } = data
	const elementTagName = resolveHtmlElement(layout?.htmlElement);
	const spacingProps = getSpacingProps(layout?.spacing);
	const isContained = layout?.containerWidth === "contained";

	const wrapperId = data?.anchorId || data?.scopeId || undefined;
	const css = typeof data?.css === "string" ? data.css.trim() : "";
	const html = typeof data?.html === "string" ? data.html : "";

	const content = (
		<div
			className="custom-html-block-content"
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);

	return createElement(
		elementTagName,
		{
			id: wrapperId,
			"data-component": "CustomHtmlBlock",
			"data-scope-id": data?.scopeId || undefined,
			className: clsx(
				"custom-html-block",
				getVisibilityClassName(data?.visibleOn),
				spacingProps.className,
				data?.cssClasses,
			),
			style: spacingProps.style,
		},
		<>
			{css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
			{isContained ? <div className="container">{content}</div> : content}
			<CustomHtmlBlockScript
				enabled={data?.script?.enabled}
				code={data?.script?.code}
				scopeId={data?.scopeId}
			/>
		</>,
	);
}
