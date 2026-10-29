"use client";

import { useId, useState } from "react";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Email + button (Figma "Subscription Form": 12px apart, both 56px tall, radius 12; the field is white at 10% with no
 * border, the button is MacroRed). Validates the format and carries the honeypot (`website`, hidden, must stay empty).
 * Sending is not wired until the CMS exposes `form.endpoint` and `form.list` (core phases II/III): the browser will then
 * post to a route of this app, which calls the CMS with the API key and the reader's IP (never straight from the browser).
 * @param {{
 *   form: { endpoint: string | null, list: string | null, emailPlaceholder: string, submitLabel: string, successMessage: string, pendingMessage: string },
 *   dark: boolean,
 *   labels: { emailLabel: string, invalidEmail: string, sending: string, rateLimited: string, error: string, unavailable: string },
 * }} props
 */
export default function Form({ form, dark, labels }) {
	const id = useId();
	const [state, setState] = useState({ status: "idle", message: "" });
	const ready = Boolean(form.endpoint && form.list);

	function onSubmit(event) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		if (data.get("website")) {
			return;
		}
		if (!EMAIL.test(String(data.get("email") ?? "").trim())) {
			setState({ status: "error", message: labels.invalidEmail });
			return;
		}
		setState({ status: ready ? "sending" : "error", message: ready ? labels.sending : labels.unavailable });
	}

	return (
		<form onSubmit={onSubmit} noValidate>
			<div className="flex flex-col gap-3 sm:flex-row">
				<label htmlFor={`${id}-email`} className="sr-only">
					{labels.emailLabel}
				</label>
				<input
					id={`${id}-email`}
					name="email"
					type="email"
					autoComplete="email"
					placeholder={form.emailPlaceholder}
					aria-invalid={state.status === "error"}
					aria-describedby={`${id}-status`}
					className={`h-14 w-full min-w-0 rounded-xl sm:flex-1 px-4 text-sm tracking-[1px] outline-none focus-visible:ring-2 focus-visible:ring-accent ${
						dark ? "bg-white/10 text-[#e2e2e4] placeholder:text-[#e2e2e4]/[0.33]" : "bg-black/5 text-ink placeholder:text-muted"
					}`}
				/>
				<div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
					<input name="website" type="text" tabIndex={-1} autoComplete="off" />
				</div>
				<button
					type="submit"
					disabled={state.status === "sending"}
					className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-8 font-display text-lg/6 font-semibold tracking-[-0.18px] text-white transition hover:opacity-90"
				>
					{form.submitLabel || "Suscribirme"}
					<svg aria-hidden="true" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
						<path d="M5 12h14M12 5l7 7-7 7" />
					</svg>
				</button>
			</div>
			<p id={`${id}-status`} role="status" aria-live="polite" className={state.message ? `mt-3 text-sm/5 ${state.status === "error" ? "text-[#ff8a8a]" : ""}` : "sr-only"}>
				{state.message}
			</p>
		</form>
	);
}
