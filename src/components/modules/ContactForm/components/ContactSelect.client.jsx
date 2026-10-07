"use client";

import PropTypes from "prop-types";
import Select from "react-select";

export default function ContactSelect({ selectRef, ...props }) {
	return <Select {...props} ref={selectRef} />;
}

ContactSelect.propTypes = {
	selectRef: PropTypes.oneOfType([
		PropTypes.func,
		PropTypes.shape({ current: PropTypes.any }),
	]),
};

ContactSelect.defaultProps = {
	selectRef: null,
};
