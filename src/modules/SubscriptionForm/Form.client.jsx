"use client";

import { useId, useState } from "react";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Email + button. Validates the format and carries the honeypot (`website`, hidden, must stay empty). Sending is not
 * wired until the CMS exposes `form.endpoint` and `form.list` (core phases II/III): the browser will then post to a
 * route of this app, which calls the CMS with the API key and the reader's IP (never straight from the browser).
 * @param {{
 *   form: { endpoint: string | null, list: string | null, emailPlaceholder: string, submitLabel: string, successMessage: string, pendingMessage: string },
 *   buttonVariant: string, dark: boolean,
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
		<form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
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
					className={`h-14 min-w-0 flex-1 rounded-xl border px-4 text-base/6 outline-none focus-visible:ring-2 focus-visible:ring-accent ${
						dark ? "border-white/20 bg-white/10 text-white placeholder:text-white/60" : "border-neutral-300 bg-white text-ink placeholder:text-muted"
					}`}
				/>
				<div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
					<input name="website" type="text" tabIndex={-1} autoComplete="off" />
				</div>
				<button
					type="submit"
					disabled={state.status === "sending"}
					className="h-14 rounded-2xl bg-primary px-8 text-base/6 font-bold text-white transition hover:opacity-90"
				>
					{form.submitLabel || "Suscribirme"}
				</button>
			</div>
			<p id={`${id}-status`} role="status" aria-live="polite" className={`min-h-5 text-sm/5 ${state.status === "error" ? "text-[#ff8a8a]" : ""}`}>
				{state.message}
			</p>
		</form>
	);
}
