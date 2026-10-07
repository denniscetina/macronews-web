const MODULE_LOADERS = Object.freeze({
	Hero: () => import("@/components/modules/Hero"),
	UnicoHero: () => import("@/components/modules/UnicoHero"),
	CardTextInfo: () => import("@/components/modules/CardTextInfo"),
	CardImageWithText: () => import("@/components/modules/CardImageWithText"),
	ImageOverlayGrid: () => import("@/components/modules/ImageOverlayGrid/ImageOverlayGrid"),
	DescriptionCard: () => import("@/components/modules/DescriptionCard/DescriptionCard"),
	TermsAndConditions: () => import("@/components/modules/TermsAndConditions"),
	RestaurantMenuCard: () => import("@/components/modules/RestaurantMenuCard/RestaurantMenuCard"),
	SectionTitle: () => import("@/components/modules/SectionTitle/SectionTitle"),
	DiningDescriptionCard: () => import("@/components/modules/DiningDescriptionCard/DiningDescriptionCard"),
	DownloadAppCard: () => import("@/components/modules/DownloadAppCard/DownloadAppCard"),
	ImageOverlayGridRotating: () => import("@/components/modules/ImageOverlayGridRotating/ImageOverlayGridRotating"),
	CardWithCarousel: () => import("@/components/modules/CardWithCarousel/CardWithCarousel"),
	TagembedGoogleReviewsWidget: () => import("@/components/modules/TagembedGoogleReviewsWidget/TagembedGoogleReviewsWidget"),
	AirportTransportationRates: () => import("@/components/modules/AirportTransportationRates/AirportTransportationRates"),
	DescriptiveSectionWithImage: () => import("@/components/modules/DescriptiveSectionWithImage/DescriptiveSectionWithImage"),
	MosaicGalley: () => import("@/components/modules/MosaicGallery"),
	SimpleTitle: () => import("@/components/modules/SimpleTitle/SimpleTitle"),
	DialogBox: () => import("@/components/modules/DialogBox/DialogBox"),
	AddressContact: () => import("@/components/modules/AddressContact"),
	ListToContactUs: () => import("@/components/modules/ListToContactUs/ListToContactUs"),
	UnauthorizedChannels: () => import("@/components/modules/UnauthorizedChannels/UnauthorizedChannels"),
	RoomsPost: () => import("@/components/modules/RoomPost/RoomPost"),
	RoomTemplate: () => import("@/components/modules/RoomTemplate/RoomTemplate"),
	MapSection: () => import("@/components/modules/MapSection/MapSection"),
	GoBackTo: () => import("@/components/modules/GoBackTo"),
	OffersList: () => import("@/components/modules/OffersList"),
	OfferTemplate: () => import("@/components/modules/OfferTemplate"),
	ContactForm: () => import("@/components/modules/ContactForm"),
	CustomHtmlBlock: () => import("@/components/modules/CustomHtmlBlock"),
});

const moduleComponentCache = new Map();

export async function getModuleComponent(type) {
	if (!type) {
		return null;
	}

	if (moduleComponentCache.has(type)) {
		return moduleComponentCache.get(type);
	}

	const loadModule = MODULE_LOADERS[type];

	if (!loadModule) {
		return null;
	}

	const modulePromise = loadModule()
		.then((loadedModule) => loadedModule?.default ?? null)
		.catch((error) => {
			moduleComponentCache.delete(type);
			throw error;
		});

	moduleComponentCache.set(type, modulePromise);
	return modulePromise;
}
