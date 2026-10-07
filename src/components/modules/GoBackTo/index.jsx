import CustomButton from "@/components/utils/ButtonLink";

export default function GoBackTo({ data }){
	return (
		<section
			data-component="GoBackTo"
			className="relative overflow-hidden bg-alt w-full py-16 flex justify-center gap-8"
		>
			<CustomButton
				config={data.link}
				className="border-b capitalize"
				iconPosition="left"
			/>
		</section>
	)
}