/** @param {{ name: string, dictionary: any }} props */
export default function Footer({ name, dictionary }) {
	return (
		<footer className="border-t border-black/10 py-6 text-center text-sm text-muted">
			© {new Date().getFullYear()} {name}. {dictionary.layout.footer.rights}
		</footer>
	);
}
