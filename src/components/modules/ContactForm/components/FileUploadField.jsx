import PropTypes from "prop-types";

export default function FileUploadField({
	containerClass,
	field,
	fieldName,
	inputId,
	register,
	commonRegisterRules,
	hasError,
	errorMessage,
	fileName,
	onFileNameChange,
}) {
	return (
		<div className={containerClass}>
			<div
				className={`font-futura font-normal text-[#253746] leading-6.5 mb-2 ${
					hasError ? "text-red-500" : ""
				}`}
			>
				{field.label}
			</div>
			<div className="relative">
				<input
					type="file"
					id={inputId}
					className="hidden"
					{...register(fieldName, {
						...commonRegisterRules,
						onChange: (event) => {
							const selectedFile = event.target.files?.[0];
							onFileNameChange(selectedFile?.name ?? "");
							return event;
						},
					})}
				/>
				<label
					htmlFor={inputId}
					className={`file-upload-label ${fileName ? "has-file" : ""}`}
				>
					<span className="truncate">{fileName || "No file selected"}</span>
					<span className="file-upload-button">
						{fileName ? "Change file" : "Select file"}
					</span>
				</label>
				{hasError && <div className="text-red-500 text-xs mt-1 font-futura">{errorMessage}</div>}
			</div>
		</div>
	);
}

FileUploadField.propTypes = {
	containerClass: PropTypes.string.isRequired,
	field: PropTypes.object.isRequired,
	fieldName: PropTypes.string.isRequired,
	inputId: PropTypes.string.isRequired,
	register: PropTypes.func.isRequired,
	commonRegisterRules: PropTypes.object,
	hasError: PropTypes.bool,
	errorMessage: PropTypes.string,
	fileName: PropTypes.string,
	onFileNameChange: PropTypes.func.isRequired,
};

FileUploadField.defaultProps = {
	commonRegisterRules: {},
	hasError: false,
	errorMessage: "",
	fileName: "",
};
