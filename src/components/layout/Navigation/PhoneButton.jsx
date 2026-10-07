"use client";
import PhoneIcon from "@/components/icons/Phone";
import { useSiteInit } from "@/context/SiteInitProvider";

const resolveSiteInitPhone = (primaryContact, contactItems) => {
	const primaryValue =
		typeof primaryContact?.contactValue === "string"
			? primaryContact.contactValue.trim()
			: "";

	if (primaryValue) {
		return primaryValue;
	}

	if (!Array.isArray(contactItems)) {
		return "";
	}

	const firstPhoneContact = contactItems.find((item) => {
		const type = String(item?.type ?? "")
			.trim()
			.toLowerCase();
		const contactValue =
			typeof item?.contactValue === "string" ? item.contactValue.trim() : "";

		return type === "phone" && Boolean(contactValue);
	});

	return typeof firstPhoneContact?.contactValue === "string"
		? firstPhoneContact.contactValue.trim()
		: "";
};

export default function PhoneButton({ variant = "desktop" }) {
	const { primaryContact, contactItems } = useSiteInit();
	const siteInitPhone = resolveSiteInitPhone(primaryContact, contactItems);
	const normalizedPhone = String(siteInitPhone).trim();

	if (!normalizedPhone) {
		return null;
	}

	const href = normalizedPhone.startsWith("tel:")
		? normalizedPhone
		: `tel:${normalizedPhone.replace(/\s+/g, "")}`;

	// Desktop variant - small circular button
	if (variant === "desktop") {
		return (
			<a
				href={href}
				aria-label={`Call ${normalizedPhone}`}
				className="hidden lg:flex lg:h-8 lg:w-8 xl:h-9 xl:w-9 1xl:h-10 1xl:w-10 items-center justify-center rounded-full border border-transparent transition-colors duration-300 text-white group-[.active]/header:text-secondary hover:border-white group-[.active]/header:hover:border-secondary"
			>
				<PhoneIcon
					className="lg:h-[14px] lg:w-[14px] xl:h-[16px] xl:w-[16px] 1xl:h-[18px] 1xl:w-[18px]"
					pathClassName="fill-white group-[.active]/header:fill-secondary"
				/>
			</a>
		);
	}

	// Mobile variant - large rectangular button for drawer
	return (
		<a
			href={href}
			className="h-[56px] border border-secondary text-secondary flex items-center justify-center gap-4 uppercase tracking-[1px] bg-accent"
			aria-label={`Call ${normalizedPhone}`}
		>
			<PhoneIcon
				className="w-4 h-4"
				pathClassName="fill-secondary"
			/>
			<span className="font-futura text-[16px]">
				CALL {normalizedPhone}
			</span>
		</a>
	);
}
