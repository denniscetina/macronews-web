import SectionFrame from "@/components/ui/SectionFrame";
import SectionHeading from "@/components/ui/SectionHeading";
import CmsImage from "@/components/ui/CmsImage";
import { colorVar } from "@/lib/design-tokens";
import { getDictionary } from "@/i18n";
import Form from "./Form.client";

// Figma "SECTION 8: EL MACRO BRIEF": white band with 48px above, 80px below and 24px at the sides around the card.
const DEFAULTS = {
	padding: {
		desktop: { top: "3rem", right: "1.5rem", bottom: "5rem", left: "1.5rem" },
		mobile: { top: "2rem", right: "1rem", bottom: "3rem", left: "1rem" },
	},
};

const ICONS = {
	check: <path d="M20 6 9 17l-5-5" />,
	lock: (
		<>
			<rect width="18" height="11" x="3" y="11" rx="2" />
			<path d="M7 11V7a5 5 0 0 1 10 0v4" />
		</>
	),
	shield: <path d="M20 13c0 5-3.5 7.5-7.7 8.9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />,
	users: (
		<>
			<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
		</>
	),
	mail: (
		<>
			<rect width="20" height="16" x="2" y="4" rx="2" />
			<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
		</>
	),
	clock: (
		<>
			<circle cx="12" cy="12" r="10" />
			<path d="M12 6v6l4 2" />
		</>
	),
	star: <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />,
};

/**
 * Newsletter card ("El Macro Brief"): 24px radius, 72px padding, text and form on the left (672px column). The CMS
 * background image (the product composition, 432x369) is pinned flush to the bottom right corner at 85% (in the Figma
 * the art is a 522x392 box bleeding 87px right and 23px below; the CMS file is exactly the part that stays visible, so it
 * goes at natural size); a blurred dark red circle (#7F0000 at 20%, 345px, 91px out right and 100px below) sits behind it. Sending needs the CMS `form.endpoint` and `form.list` (core phases II/III): until then
 * the form validates but does not send.
 * @param {{ data: ReturnType<typeof import("@/server/cms/mappers/sections").mapSections>[number]["data"], lang: string }} props
 */
export default async function SubscriptionForm({ data, lang }) {
	const { modules } = await getDictionary(lang);
	const dark = data.theme === "dark";
	const image = data.background.image.desktop;
	const text = dark ? "text-[#e2e2e4]" : "text-[#555552]";
	return (
		<SectionFrame spacing={data.spacing} defaults={DEFAULTS} theme={data.theme} className="bg-white">
			<div
				className={`relative mx-auto flex max-w-[1232px] flex-col overflow-hidden rounded-3xl p-6 md:p-[72px] ${dark ? "bg-charcoal text-white" : "bg-surface text-ink"}`}
				style={{ backgroundColor: colorVar(data.background.color) ?? undefined }}
			>
				<div className="relative z-[1] flex w-full max-w-[700px] flex-col gap-3 pt-[3px] md:w-[672px]">
					<SectionHeading heading={data.heading} dark={dark} variant="brief" eyebrowColor="var(--color-accent)" eyebrowText="var(--color-macro-black)" />
					{data.description ? <p className={`text-base/6 ${text}`}>{data.description}</p> : null}
					{data.form ? (
						<div className="pt-5">
							<Form form={data.form} dark={dark} labels={modules.subscription} />
						</div>
					) : null}
					{data.highlights.length > 0 ? (
						<ul className="flex flex-col gap-3 pt-3 sm:flex-row sm:flex-wrap sm:gap-x-6">
							{data.highlights.map((item, index) => (
								<li key={`${index}-${item.text}`} className={`flex items-center gap-1 text-xs/4 tracking-[0.12px] ${text}`}>
									<svg
										aria-hidden="true"
										viewBox="0 0 24 24"
										width="12"
										height="12"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="shrink-0 text-primary"
									>
										{ICONS[item.icon]}
									</svg>
									{item.text}
								</li>
							))}
						</ul>
					) : null}
				</div>
				<div aria-hidden="true" className="pointer-events-none absolute -bottom-[100px] -right-[91px] hidden h-[345px] w-[345px] rounded-full bg-[#7f0000]/20 blur-[20px] md:block" />
				{image ? (
					<CmsImage
						image={image}
						alt=""
						aria-hidden="true"
						width={432}
						height={369}
						className="pointer-events-none -mx-6 -mb-6 mt-6 h-auto w-[calc(100%+3rem)] max-w-none opacity-85 md:absolute md:bottom-0 md:right-0 md:m-0 md:h-[369px] md:w-[432px]"
					/>
				) : null}
			</div>
		</SectionFrame>
	);
}
