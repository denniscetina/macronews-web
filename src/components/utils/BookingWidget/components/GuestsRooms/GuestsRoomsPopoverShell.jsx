import PropTypes from "prop-types";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import IconBed from "./IconBed";

export default function GuestsRoomsPopoverShell({
	className,
	label,
	summaryLabel,
	isOpen,
	isSurfaceMode = false,
	popoverDirection = "down",
	popoverMaxHeight = null,
	containerRef,
	triggerRef,
	popoverRef,
	onToggle,
	children,
}) {
	return (
		<div
			data-slot="guests-rooms"
			ref={containerRef}
			className={clsx(
				"booking-widget-field booking-widget-guests-rooms py-2",

				"relative",
				className
			)}
		>
			<span
				className={clsx(
					"booking-widget-label",
					isSurfaceMode && "booking-widget-label-surface",
				)}
			>
				{label}
			</span>

			<button
				type="button"
				onClick={onToggle}
				aria-expanded={isOpen}
				aria-haspopup="dialog"
				ref={triggerRef}
				className={clsx(
					"booking-widget-combined-trigger",
					isSurfaceMode
						? "booking-widget-combined-trigger-surface"
						: "booking-widget-combined-trigger-inverse",
				)}
			>
				<IconBed
					color={isSurfaceMode ? "surface" : "inverse"}
					className="mr-2 inline-block align-middle"
				/>
				{summaryLabel}
			</button>

			<AnimatePresence mode="wait">
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 10 }}
						transition={{ duration: 0.1, ease: "easeInOut" }}
						ref={popoverRef}
						role="dialog"
						aria-label="Guests and rooms selector"
						style={popoverMaxHeight ? { maxHeight: `${popoverMaxHeight}px` } : undefined}
						className={clsx(
							"booking-widget-guests-rooms-popover",
							"absolute left-0 w-full min-w-[260px] bg-white drop-shadow-xl p-4 z-30 overflow-y-auto",
							popoverDirection === "up"
								? "booking-widget-guests-rooms-popover-up bottom-[calc(100%+10px)] top-auto mt-2"
								: "booking-widget-guests-rooms-popover-down top-[calc(100%+10px)] bottom-auto mt-2",
							isSurfaceMode && "booking-widget-guests-rooms-popover-surface bg-white border-secondary/30",
						)}
					>
						{children}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

GuestsRoomsPopoverShell.propTypes = {
	className: PropTypes.string,
	label: PropTypes.string.isRequired,
	summaryLabel: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	isSurfaceMode: PropTypes.bool,
	popoverDirection: PropTypes.oneOf(["up", "down"]),
	popoverMaxHeight: PropTypes.number,
	containerRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
	triggerRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
	popoverRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
	onToggle: PropTypes.func.isRequired,
	children: PropTypes.node.isRequired,
};
