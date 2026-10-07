import PropTypes from "prop-types";
import ContactForm from "./ContactForm";

ContactFormServer.propTypes = {
	data: PropTypes.object,
	site: PropTypes.object,
	dict: PropTypes.object,
};

export default async function ContactFormServer({ data, dict }) {
	const rawData = data && typeof data === "object" ? data : {};
	const { submitURL: _ignoredSubmitUrl, ...safeData } = rawData;

	const formSchema = {
		...safeData,
	};

	return <ContactForm data={safeData} formSchema={formSchema} dict={dict} />;
}
