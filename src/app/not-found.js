import Link from "next/link";
import "@/styles/globals.css";

export default function NotFound() {
	return (
		<html lang="es">
			<body className="grid min-h-screen place-items-center text-center">
				<div>
					<h1 className="text-3xl font-bold">404</h1>
					<p className="mt-2 text-muted">Página no encontrada / Page not found</p>
					<Link href="/" className="mt-4 inline-block underline">
						Inicio / Home
					</Link>
				</div>
			</body>
		</html>
	);
}
