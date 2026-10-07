import dynamic from "next/dynamic";
import useHeroResponsivePicture from "@/hooks/useHeroResponsivePicture";
import HeroBookingWidget from "./HeroBookingWidget.client";

const HeroVideoLayer = dynamic(() => import("./HeroVideoLayer.client"));
/**
 * Genera una fuente de video segun el tipo seleccionado.
 * @param {Object} params - Datos normalizados del video.
 * @returns {Object|null} - { type: 'iframe'|'video', url: string } o null
 */
const buildVideoSource = ({ type, embedId, uploadVideo, externalUrl }) => {
    switch (type) {
        case "youtube":
            return embedId ? {
                type: "iframe",
                url: `https://www.youtube.com/embed/${embedId}?autoplay=1&mute=1&loop=1&playlist=${embedId}&controls=0&showinfo=0&rel=0&playsinline=1&enablejsapi=1&modestbranding=1`,
            } : null;
        case "vimeo":
            return embedId ? {
                type: "iframe",
                url: `https://player.vimeo.com/video/${embedId}?autoplay=1&muted=1&loop=1&background=1`,
            } : null;
        case "self_hosted":
            return uploadVideo?.url ? { type: "video", url: uploadVideo.url } : null;
        case "external":
            return externalUrl ? { type: "video", url: externalUrl } : null;
        default:
            return null;
    }
};

/**
 * Genera la configuracion responsive de video desde WordPress.
 * @param {Object} videoConfig - Configuracion del video desde WordPress.
 * @returns {Object|null} - { desktop: Object|null, mobile: Object|null } o null
 */
const getVideoSource = (videoConfig) => {
    if (!videoConfig || !videoConfig.is_render_video) return null;

    const {
		type_of_video,
		id_youtube_or_vimeo,
		upload_video,
		external_url,
		type_of_video_mobile,
		id_youtube_or_vimeo_mobile,
		upload_video_mobile,
		external_url_mobile,
	} = videoConfig;

	const desktop = buildVideoSource({
		type: type_of_video,
		embedId: id_youtube_or_vimeo,
		uploadVideo: upload_video,
		externalUrl: external_url,
	});
	const mobile = buildVideoSource({
		type: type_of_video_mobile,
		embedId: id_youtube_or_vimeo_mobile,
		uploadVideo: upload_video_mobile,
		externalUrl: external_url_mobile,
	});

	return desktop || mobile ? { desktop, mobile } : null;
};
/**
 * Index - Hero section con soporte para imagen o video de fondo
 *
 * Soporta 4 tipos de video:
 * - youtube: Video de YouTube (iframe)
 * - vimeo: Video de Vimeo (iframe)
 * - self_hosted: Video subido a WordPress (video nativo)
 * - external: URL externa de video (video nativo)
 */
export default function UnicoHero({ data }){
    const { backgroundImage, render_video_hero, show_panel_reserve } = data;
    const videoSource = getVideoSource(render_video_hero);
    const {
        desktopSrcSet,
        tabletSrcSet,
        mobileSrcSet,
        mobileSrc,
        imgProps,
        heroAlt,
        fallbackImage,
    } = useHeroResponsivePicture(backgroundImage, {
        title: "Hero Background",
    });

    const renderPosterImages = () => (
        fallbackImage?.url ? (
            <picture className="absolute inset-0 block h-full w-full">
                <source media="(min-width: 1024px)" srcSet={desktopSrcSet} />
                <source media="(min-width: 768px)" srcSet={tabletSrcSet} />
                <source media="(max-width: 767px)" srcSet={mobileSrcSet} />
                <img
                    {...imgProps}
                    src={mobileSrc}
                    alt={heroAlt}
                    title={fallbackImage.title || "Hero Background"}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="h-full w-full object-cover"
                />
            </picture>
        ) : null
    );

    const renderBackgroundMedia = () => {
        if (videoSource?.desktop || videoSource?.mobile) {
            return (
				<>
					{renderPosterImages()}
					<HeroVideoLayer
						videoSource={videoSource.desktop}
						mobileVideoSource={videoSource.mobile}
						poster={backgroundImage?.desktopImage?.url}
						posterMobile={backgroundImage?.mobileImage?.url}
					/>
				</>
			);
		}
		// Fallback a imágenes responsivas si no hay video
		return renderPosterImages();
	};
	return (
		<section
			data-component="UnicoHero"
			className="relative w-full h-screen z-80"
		>
			{/* Contenedor para el fondo (video o imagen) */}
			<div className="relative inset-0 z-0 h-full">
				<div className="relative w-full h-full overflow-hidden pointer-events-none">
					{renderBackgroundMedia()}
					{/* Overlay de gradiente */}
                    <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-transparent via-transparent to-black/70 lg:bg-gradient-to-b" />
                </div>
				{/* Contenido del Hero */}
				<div className="container absolute #w-full bottom-0 right-0 left-0 my-8 max-w-5/6 lg:max-w-full xl:min-w-7xl">
					{
						show_panel_reserve && (
							<HeroBookingWidget />
						)
					}
				</div>
            </div>
        </section>
	);
};
