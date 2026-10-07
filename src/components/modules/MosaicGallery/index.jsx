import GridGallery from "./GridGallery";
import MosaicGalleryTabs from "@/components/modules/MosaicGallery/MosaicGalleryTabs";

export default function MosaicGallery({ data }) {
	const { icon, title, gallery_items = [] } = data || {};

	const listTabs = ["All", ...gallery_items.map((cat) => cat.section_name)]
	const allImages = Array.isArray(gallery_items)
				? gallery_items.reduce((acc, item) => {
					if (item.gallery && Array.isArray(item.gallery)) {
						acc.push(...item.gallery);
					}
					return acc;
				}, [])
				: []

	const contentTabs = [
			{
				key: "All",
				components: <GridGallery data={allImages} />,
			},
			...gallery_items.map((item) => ({
				key: item.section_name,
				components: <GridGallery data={item.gallery} />,
			})),
		]

	return (
		<section
			data-component="MosaicGallery"
			className="pt-[64px] pb-[128px] container bg-base2 mt-[60px] lg:mt-[76px]">
			<div className="inner-container flex flex-col gap-[16px] justify-center items-center text-center">
				{icon?.url && (
					<img
						className="bg-cover bg-center h-[34px] w-[34px]"
						src={icon.url}
						alt="icon mosaic gallery"
						loading="lazy"
					/>
				)}
				<h1 className="text-center mx-auto text-primary header-2 !font-glosa py-[32px] lg:pt-[80px] lg:pb-[60px] capitalize">
					{title}
				</h1>
			</div>
			<MosaicGalleryTabs listTabs={listTabs} contentTabs={contentTabs} />
		</section>
	);
}