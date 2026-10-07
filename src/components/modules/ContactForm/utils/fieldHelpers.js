export const getWidthClass = (size = "large") => {
	const containerLayout = {
		"large" : "cf-layout-lg",
		"medium" : "cf-layout-md",
		"small" : "cf-layout-sm",
	}
	return containerLayout[size];
}

export const getSelectWidthClass = (cssClass) => {
	const cssClasses = cssClass ? cssClass.split(" ") : [];
	const filteredClasses = cssClasses.filter((cssToken) => cssToken !== "single_option");

	return filteredClasses.length > 0
		? `gf-layout-${filteredClasses.join(" ")}`
		: "gf-layout-12/12";
};

export const getFieldName = (field) => {
	const name = field?.label ?? field?.id ?? "";
	return String(name);
};

export const getRequiredRule = (field, fallbackMessage) =>{
	return field.isRequired ? field.errorMessage || fallbackMessage : false;
}
