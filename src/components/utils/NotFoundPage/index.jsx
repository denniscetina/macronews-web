import Link from "next/link";
import Hero from "./Hero";
import "@/app/globals.css"
export default function NotFound() {
	return(
		<>
			<Hero></Hero>
			<section className="container mx-auto flex justify-center py-16">
				<div className="flex flex-col items-center gap-4">
					<h1 className="text-2xl font-medium">Oopps! 404: Not Found</h1>
					<p>The page you are looking for cannot be found.</p>
					<p>It is either missing or no longer exists.</p>
					<Link href="/" className="text-primary underline">Back to Home</Link>
				</div>
			</section>
		</>
	);
}