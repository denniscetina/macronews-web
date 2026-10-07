import PropTypes from "prop-types";
import clsx from "clsx";
import IconPin from "./IconPin";
import DotsLoader from "./DotsLoader";

export default function OriginBoxField({
	label,
	isSurfaceMode = false,
	isDisabledState = false,
	searchTerm,
	placeholder,
	isLoading = false,
	selectedOption = null,
	minCharsText = "",
	hasEnoughCharacters = false,
	onFocus,
	onInputChange,
	onToggleOptions,
	ref
}) {
	return (
		<>
			<span
				className={clsx(
					"booking-widget-label",
					isSurfaceMode ? "!text-secondary" : "text-white",
				)}
			>
				{label}
			</span>

			<div className="relative" ref={ref}>
				<div
					className={clsx(
						"flex items-center min-h-[38px] transition-colors duration-200",
						isDisabledState && "opacity-60 cursor-not-allowed",
					)}
				>
					<IconPin
						color={isSurfaceMode ? "surface" : "inverse"}
						className="mr-1 shrink-0"
					/>

					<input
						type="text"
						value={searchTerm}
						disabled={isDisabledState}
						placeholder={placeholder}
						onFocus={onFocus}
						onChange={onInputChange}
						className={clsx(
							"ml-2 !p-0 focus:outline-none focus:ring-0 w-full box-content truncate",
							"flex-1 bg-transparent border-0 outline-none font-futura leading-[24px]",
							isSurfaceMode
								? "text-secondary placeholder:text-[#b0b2ba]"
								: "text-white placeholder:text-white/70",
						)}
					/>

					<div className="relative shrink-0 flex items-center justify-center">
						{isLoading && (
							<div className="absolute right-0">
								<DotsLoader isSurfaceMode={isSurfaceMode} />
							</div>
						)}
					</div>

					<button
						type="button"
						disabled={isDisabledState}
						onClick={onToggleOptions}
						className={clsx(
							"hidden shrink-0 ml-2 w-8 h-8 border rounded-sm flex items-center justify-center",
							isSurfaceMode
								? "border-secondary/20 bg-[#f0f1f5]"
								: "border-white/30 bg-white/10"
						)}
						aria-label="Toggle origin options"
					>
						{isLoading ? (
							<DotsLoader isSurfaceMode={isSurfaceMode} />
						) : (
							<svg
								width="12"
								height="12"
								viewBox="0 0 12 12"
								fill="none"
								aria-hidden="true"
							>
								<path
									d="M2.5 4.5L6 8L9.5 4.5"
									stroke={isSurfaceMode ? "#253746" : "#FFFFFF"}
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						)}
					</button>
				</div>

				{!hasEnoughCharacters && searchTerm.length > 0 && (
					<p className="hidden mt-2 text-xs font-futura text-secondary/70">{minCharsText}</p>
				)}

				{isLoading && (
					<p className="hidden mt-2 text-xs font-futura text-secondary/70">
						Loading...
					</p>
				)}
				{selectedOption && (
					<span className="sr-only">
						Selected origin: {selectedOption.label} ({selectedOption.code})
					</span>
				)}
			</div>
		</>
	);
}

OriginBoxField.propTypes = {
	label: PropTypes.string.isRequired,
	isSurfaceMode: PropTypes.bool,
	isDisabledState: PropTypes.bool,
	searchTerm: PropTypes.string.isRequired,
	placeholder: PropTypes.string.isRequired,
	isLoading: PropTypes.bool,
	selectedOption: PropTypes.object,
	minCharsText: PropTypes.string,
	hasEnoughCharacters: PropTypes.bool,
	onFocus: PropTypes.func.isRequired,
	onInputChange: PropTypes.func.isRequired,
	onToggleOptions: PropTypes.func.isRequired,
};
