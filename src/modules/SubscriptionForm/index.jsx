import SectionFrame from "@/components/ui/SectionFrame";
import SectionHeading from "@/components/ui/SectionHeading";
import CmsImage from "@/components/ui/CmsImage";
import { colorVar } from "@/lib/design-tokens";
import { getDictionary } from "@/i18n";
import Form from "./Form.client";

// Figma "El Macro Brief": 1280px content box, card with 24px radius and 72px padding.
const DEFAULTS = {
	padding: {
		desktop: { top: "0", right: "0", bottom: "6rem", left: "0" },
		mobile: { top: "0", right: "0", bottom: "3rem", left: "0" },
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
 * Newsletter card ("El Macro Brief"). The text and form sit on one side, the CMS background image (the product
 * composition) fills the card. Sending needs the CMS `form.endpoint` and `form.list` (core phases II/III): until then
 * the form validates but does not send.
 * @param {{ data: ReturnType<typeof import("@/server/cms/mappers/sections").mapSections>[number]["data"], lang: string }} props
 */
export default async function SubscriptionForm({ data, lang }) {
	const { modules } = await getDictionary(lang);
	const dark = data.theme === "dark";
	const image = data.background.image.desktop;
	return (
		<SectionFrame spacing={data.spacing} defaults={DEFAULTS} theme={data.theme} className="bg-white">
			<div className="mx-auto w-full max-w-[1280px] px-4 md:px-8">
				<div
					className={`relative overflow-hidden rounded-3xl p-6 md:p-[72px] ${dark ? "bg-ink text-white" : "bg-surface text-ink"}`}
					style={{ backgroundColor: colorVar(data.background.color) ?? undefined }}
				>
					{image ? (
						<CmsImage
							image={image}
							alt=""
							aria-hidden="true"
							className="pointer-events-none mx-auto mb-6 h-auto w-full max-w-[432px] opacity-85 md:absolute md:right-[72px] md:top-1/2 md:mb-0 md:w-[432px] md:-translate-y-1/2"
						/>
					) : null}
					<div className="relative flex max-w-[640px] flex-col gap-6 md:max-w-[58%]">
						<SectionHeading heading={data.heading} dark={dark} eyebrowColor="var(--color-accent)" eyebrowText="var(--color-black)" />
						{data.description ? <p className={`text-base/6 ${dark ? "text-[#e5e5e5]" : "text-[#555552]"}`}>{data.description}</p> : null}
						{data.form ? (
							<Form form={data.form} buttonVariant={data.buttonVariant} dark={dark} labels={modules.subscription} />
						) : null}
						{data.highlights.length > 0 ? (
							<ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6">
								{data.highlights.map((item, index) => (
									<li key={`${index}-${item.text}`} className={`flex items-center gap-2 text-sm/5 ${dark ? "text-[#e5e5e5]" : "text-[#555552]"}`}>
										<svg
											aria-hidden="true"
											viewBox="0 0 24 24"
											width="16"
											height="16"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="shrink-0 text-accent"
										>
											{ICONS[item.icon]}
										</svg>
										{item.text}
									</li>
								))}
							</ul>
						) : null}
					</div>
				</div>
			</div>
		</SectionFrame>
	);
}
