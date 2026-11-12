"use client";

import { useState } from "react";

const BUTTON = "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const ICONS = {
	whatsapp: <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.2 1.4 2.5 1.5.3.2.5.1.7-.1l.9-1.1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.8-.1 1.4Z" />,
	x: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" />,
	facebook: <path d="M13.5 22v-8.2h2.8l.5-3.3h-3.3V8.4c0-.95.4-1.7 1.8-1.7h1.6V3.8c-.3 0-1.3-.1-2.4-.1-2.5 0-4.1 1.5-4.1 4.2v2.6H7.5v3.3h2.9V22Z" />,
};

/**
 * "Share" of a post (Figma `Single Post`): a vertical pill with WhatsApp, X, Facebook and copy link (the design adds a
 * bookmark: there is no account or saved list to back it, so it is left out). Each network opens its own share window with
 * the post's title and canonical URL; the copy button uses the clipboard and says so. On wide screens it sits in the left
 * gutter and follows the reader (`sticky`); below that it is a row under the title (not designed: provisional).
 * @param {{ url: string, title: string, labels: Record<string, string> }} props
 */
export default function ShareBar({ url, title, labels }) {
	const [copied, setCopied] = useState(false);
	const links = [
		{ key: "whatsapp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`, className: "bg-[#25d366] text-white" },
		{ key: "x", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, className: "bg-[#171717] text-white" },
		{ key: "facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, className: "bg-[#1877f2] text-white" },
	];
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// The clipboard is blocked (insecure page, permissions): the other buttons still work.
		}
	};
	return (
		<div role="group" aria-label={labels.label} className="flex items-center gap-2 xl:flex-col xl:gap-3 xl:rounded-full xl:bg-white xl:px-1.5 xl:py-4 xl:shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
			<span className="text-[8px]/3 font-bold uppercase tracking-[0.8px] text-[#a3a3a3]">{labels.label}</span>
			{links.map(({ key, href, className }) => (
				<a key={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={labels[key]} className={`${BUTTON} ${className}`}>
					<svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px] fill-current">
						{ICONS[key]}
					</svg>
				</a>
			))}
			<button type="button" onClick={copy} aria-label={labels.copy} className={`${BUTTON} bg-[#f0f0f0] text-[#404040] hover:bg-[#e5e5e5]`}>
				<svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px] fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
				</svg>
			</button>
			<span role="status" className="sr-only">
				{copied ? labels.copied : ""}
			</span>
			{copied ? <span aria-hidden="true" className="text-[11px]/4 font-medium text-primary xl:absolute xl:left-full xl:ml-3 xl:whitespace-nowrap xl:rounded xl:bg-[#171717] xl:px-2 xl:py-1 xl:text-white">{labels.copied}</span> : null}
		</div>
	);
}
