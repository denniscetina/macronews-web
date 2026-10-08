import "server-only";
import { timingSafeEqual } from "node:crypto";

/**
 * Constant-time comparison of a provided secret against the expected one.
 * @param {string | null | undefined} provided
 * @param {string | undefined} expected
 */
export function isValidToken(provided, expected) {
	if (!provided || !expected) {
		return false;
	}
	const a = Buffer.from(provided);
	const b = Buffer.from(expected);
	return a.length === b.length && timingSafeEqual(a, b);
}

/** @param {Request} request */
export function getBearerToken(request) {
	const header = request.headers.get("authorization") ?? "";
	return header.startsWith("Bearer ") ? header.slice(7).trim() : null;
}
