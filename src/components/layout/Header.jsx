import Link from "next/link";
import { localizePath } from "@/i18n";

/** @param {{ lang: string, name: string, menu: Array<{id?: any, label: string, url: string}> }} props */
export default function Header({ lang, name, menu }) {
	return (
		<header className="border-b border-black/10">
			<nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
				<Link href={localizePath(lang)} className="text-lg font-bold">
					{name}
				</Link>
				<ul className="flex gap-4">
					{menu.map((item, index) => (
						<li key={item.id ?? index}>
							<Link href={item.url || "#"}>{item.label}</Link>
						</li>
					))}
				</ul>
			</nav>
		</header>
	);
}
