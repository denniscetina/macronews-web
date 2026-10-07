import "../globals.css";
import {Futura, Glosa} from "@/lib/constants";

export const metadata = {
	title: "Preview Page",
	description: "Responsive preview shell for draft mode",
};



export default function PreviewLayout({ children }) {
	return (
		<html lang="en" suppressHydrationWarning className={`${Futura.className} ${Glosa.className}`}>
			<body>{children}</body>
		</html>
	);
}
