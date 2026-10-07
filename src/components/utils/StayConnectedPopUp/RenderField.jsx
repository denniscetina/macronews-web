// helpers
import has from "lodash/has";

const baseInputClass =
	"text-secondary font-futura font-normal leading-6 h-[40px] w-full mb-sm bg-alt p-2 mb-4 focus:outline-none";
const errorClass = "border-red-500";

export const fields = [
	{
		name: "first_name",
		type: "text",
		placeholder: "First Name",
		required: true,
	},
	{
		name: "last_name",
		type: "text",
		placeholder: "Last Name",
		required: true,
	},
	{
		name: "country",
		type: "select",
		placeholder: "Choose Your Country",
		required: true,
		options: [
			{ code: "EUR", label: "Europa" },
			{ code: "MXN", label: "Mexico" },
			{ code: "USD", label: "United States" },
		],
	},
	{ name: "email", type: "email", placeholder: "Email", required: true },
];

export const renderField = (field, errors, register) => {
	const hasError = has(errors, field.name);
	if (field.type === "select") {
		return (
			<select
				key={field.name}
				name={field.name}
				required={field.required}
				className={`${baseInputClass}`}
				style={{ outline: "none", boxShadow: "none" }}
				defaultValue=""
				{...register(field.name, {
					required: field.required ? `${field.placeholder} is required` : false,
				})}
			>
				<option value="" disabled>
					{field.placeholder}
				</option>
				{field.options?.map((opt) => {
					return (
						<option key={opt.code} value={opt.code}>
							{opt.label}
						</option>
					);
				})}
			</select>
		);
	}
	return (
		<input
			key={field.name}
			name={field.name}
			type={field.type}
			placeholder={field.placeholder}
			required={field.required}
			{...register(field.name, {
				required: field.required ? `${field.placeholder} is required` : false,
				...(field.name === "email" && {
					pattern: {
						value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
						message: "Please enter a valid email address",
					},
				}),
			})}
			className={`${baseInputClass} ${hasError ? errorClass : ""}`}
			style={{ outline: "none", boxShadow: "none" }}
		/>
	);
};
