import "@/styles/globals.css";

export const metadata = {
	title: "Preview",
	robots: { index: false, follow: false },
};

export default function PreviewLayout({ children }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
