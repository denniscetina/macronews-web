import clsx from 'clsx';

const SPACING_TOKENS = new Set([
	'default',
	'none',
	'xs',
	'sm',
	'md',
	'lg',
	'xl',
	'2xl',
	'3xl',
	'4xl',
	'5xl',
	'6xl',
	'7xl',
]);

const SPACING_CONFIG = {
	margin: {
		top: 'mt',
		right: 'mr',
		bottom: 'mb',
		left: 'ml',
	},
	padding: {
		top: 'pt',
		right: 'pr',
		bottom: 'pb',
		left: 'pl',
	},
};

const DEVICES = ['mobile', 'desktop'];
const SIDES = ['top', 'right', 'bottom', 'left'];

function isPlainObject(value) {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeSpacingToken(value) {
	const token = String(value ?? 'default')
		.trim()
		.toLowerCase();

	return SPACING_TOKENS.has(token) ? token : 'default';
}

function getSpacingClassName({ property, device, side, token }) {
	if (token === 'default') {
		return '';
	}

	const prefix = SPACING_CONFIG[property]?.[side];

	if (!prefix) {
		return '';
	}

	const variant = device === 'desktop' ? 'md:' : '';

	return `${variant}${prefix}-[var(--cms-spacing-${token})]`;
}

function getSpacingToken({ spacing, device, side }) {
	return normalizeSpacingToken(spacing?.[device]?.[side]);
}

function getSpacingClassNames(section, property) {
	const spacing = section?.[property];

	if (!isPlainObject(spacing)) {
		return [];
	}

	return DEVICES.flatMap((device) =>
		SIDES.map((side) =>
			getSpacingClassName({
				property,
				device,
				side,
				token: getSpacingToken({ spacing, device, side }),
			}),
		),
	);
}

export function getSpacingProps(section) {
	const className = clsx(
		getSpacingClassNames(section, 'margin'),
		getSpacingClassNames(section, 'padding'),
	);

	return {
		className,
		style: undefined,
	};
}
