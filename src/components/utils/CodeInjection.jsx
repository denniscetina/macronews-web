import { Fragment } from "react";

export default function CodeInjection({ position, scripts = [] }) {
	if (!Array.isArray(scripts) || scripts.length === 0) {
		return null;
	}

	return (
		<>
			{scripts.map((script, index) => {
				const key = script?.id || script?.name || `${position}-${index}`;
				const code = String(script?.code || "").trim();

				if (!code) {
					return null;
				}

				return (
					<Fragment key={key}>
						<div
							data-cms-code-injection={position}
							data-cms-code-injection-id={script?.id || undefined}
							dangerouslySetInnerHTML={{ __html: code }}
						/>
					</Fragment>
				);
			})}
		</>
	);
}
