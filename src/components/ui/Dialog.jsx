"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import clsx from "clsx";

/**
 * Modal dialog: the shadcn/ui Dialog on Radix (focus trap, Escape, scroll lock, screen reader semantics), written in
 * plain JavaScript. It has no preset position or size: the caller gives them with `className`.
 */
export const Dialog = DialogPrimitive.Root;
export const DialogTitle = DialogPrimitive.Title;
export const DialogClose = DialogPrimitive.Close;

/** @param {React.ComponentProps<typeof DialogPrimitive.Content>} props */
export function DialogContent({ className, children, ...props }) {
	return (
		<DialogPrimitive.Portal>
			<DialogPrimitive.Content className={clsx("fixed z-50 outline-none", className)} {...props}>
				{children}
			</DialogPrimitive.Content>
		</DialogPrimitive.Portal>
	);
}
