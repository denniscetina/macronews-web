export default function ContactLink ({ info, index }){
	return (
		<div className="contact-entry mb-4" key={index}>
			<p
				className="leading-[160%] font-futura font-medium text-secondary uppercase"
			>
				{info.displayName}
			</p>
			<a
				key={index}
				href={`${info.type === "phone" ? "tel:" : ""}${info.contactValue}`}
				className="hover:underline text-secondary body-medium"
				target={info?.target || "_blank"}
			>
				{info.contactValue}
			</a>
		</div>
	);
}
