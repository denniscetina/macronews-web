"use client";
import { useState} from "react";

export default function FixedDraftMode(){
	const [loading, setLoading] = useState(false);
	const finishDraftMode = () => {
		setLoading(true)
		fetch('/api/disable-draft', {
			method: 'GET',
		}).then(() => {
			window.location.reload()
		})
	}
	return (
		<div className="w-full test">
			<div className="overflow-hidden relative bg-zinc-800  p-2 flex justify-between gap-2 ring ring-white shadow-2xl">
				<div className="flex items-center gap-4">
					<span className="relative flex size-4">
			  		<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
			  		<span className="relative inline-flex size-4 rounded-full bg-red-500"></span>
				</span>
					<p className="!text-white font-medium !text-xs">Draft Mode</p>
				</div>
				<button
					className="!text-white !text-xs font-medium px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 cursor-pointer"
					onClick={finishDraftMode}
				>
					
					Finish
				</button>
				{
					loading &&
					<div className="inset-0 absolute flex items-center justify-center bg-black/30 cursor-not-allowed">
						<svg className="mr-3 size-5 animate-spin !text-white " viewBox="0 0 24 24">
							<path
								className="fill-white"
								d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
							/>
						</svg>
					</div>
				}
			</div>
		</div>
	)
}