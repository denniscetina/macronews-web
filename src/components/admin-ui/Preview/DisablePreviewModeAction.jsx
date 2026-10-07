"use client";
import {useState} from "react";
import clsx from "clsx";

export default function DisablePreviewModeAction({sourceAction = "/api/disable-draft"}) {
	const [loading, setLoading] = useState(false);
	const finishDraftMode = () => {
		setLoading(true)
		fetch(sourceAction, {
			method: 'GET',
		}).then(() => {
			window.location.reload()
		}).catch(() => {
			setLoading(false)
		})
	}
	return (
		<button
			className={
				clsx("relative flex flex-row gap-2 items-center text-white! text-xs! font-medium px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 cursor-pointer",
					loading && "opacity-50 cursor-not-allowed")
			}
			onClick={finishDraftMode}
		>
			{
				loading &&
				<span className="">
						<svg className="size-4 animate-spin text-white!" viewBox="0 0 24 24">
							<path
								className="fill-white"
								d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
							/>
						</svg>
					</span>
			}
			Finish
		</button>
	)
}