import PropTypes from "prop-types";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";

export default function OriginBoxOptionsDropdown({
	isDropdownOpen,
	dropdownRef,
	dropdownDirection = "down",
	dropdownMaxHeight = null,
	options = [],
	onSelectOption,
}) {
	return (
		<AnimatePresence mode="wait">
			{isDropdownOpen && (
				<motion.ul
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 10 }}
					transition={{ duration: 0.1, ease: "easeInOut" }}
					ref={dropdownRef}
					style={dropdownMaxHeight ? { maxHeight: `${dropdownMaxHeight}px` } : undefined}
					className={clsx(
						"absolute left-0 w-full bg-white drop-shadow-xl z-30 overflow-y-auto",
						dropdownDirection === "up"
							? "bottom-[calc(100%_+_1rem)]"
							: "top-full mt-2",
					)}
				>
					{options.map((option, index) => (
						<li key={`${index}-${option.value}-${option.code}`} className="group">
							<button
								type="button"
								onClick={() => onSelectOption(option)}
								className="w-full text-left px-4 py-3 border-b border-secondary/10 group-last:border-b-0  hover:bg-accent transition-colors duration-150 cursor-pointer"
							>
								<div className="flex items-start justify-between gap-3">
									<div className="flex-1">
										<p className="font-futura text-secondary text-lg leading-[20px] font-medium">
											{option.label}
										</p>
										{option.subtitle && (
											<p className="mt-1 font-futura text-[#4e5772] text-sm leading-[20px]">
												{option.subtitle}
											</p>
										)}
									</div>
									<span className="mt-1 shrink-0 rounded-[4px] bg-[#d9dbe2] px-2.5 py-1 text-[14px] leading-[14px] font-futura text-secondary">
										{option.code}
									</span>
								</div>
							</button>
						</li>
					))}
				</motion.ul>
			)}
		</AnimatePresence>
	);
}

OriginBoxOptionsDropdown.propTypes = {
	isDropdownOpen: PropTypes.bool.isRequired,
	dropdownRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
	dropdownDirection: PropTypes.oneOf(["up", "down"]),
	dropdownMaxHeight: PropTypes.number,
	options: PropTypes.arrayOf(PropTypes.object),
	onSelectOption: PropTypes.func.isRequired,
};
