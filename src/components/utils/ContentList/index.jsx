import "server-only";
import { Fragment } from "react";

export default function ContentList({
	items = [],
	className = "",
	getKey,
	renderItem,
}) {
	if (!Array.isArray(items) || items.length === 0 || typeof renderItem !== "function") {
		return null;
	}

	return (
		<div className={className}>
			{items.map((item, index) => (
				<Fragment key={getKey ? getKey(item, index) : index}>
					{renderItem(item, index)}
				</Fragment>
			))}
		</div>
	);
}
