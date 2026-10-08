"use client";

import { useState } from "react";
import clsx from "clsx";

export default function DisablePreviewModeAction({ action = "/api/disable-draft" }) {
	const [loading, setLoading] = useState(false);

	const finish = () => {
		setLoading(true);
		fetch(action)
			.then(() => window.location.reload())
			.catch(() => setLoading(false));
	};

	return (
		<button
			type="button"
			onClick={finish}
			disabled={loading}
			className={clsx(
				"rounded-md bg-red-500 px-4 py-2 text-xs font-medium text-white hover:bg-red-600",
				loading && "cursor-not-allowed opacity-50",
			)}
		>
			{loading ? "Finishing..." : "Finish"}
		</button>
	);
}
