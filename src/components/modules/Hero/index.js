import PropTypes from "prop-types";
import FadeContent from "@/components/utils/Motion/FadeContent";
import useHeroResponsivePicture from "@/hooks/useHeroResponsivePicture";
import { sanitizeTitleHtml } from "@/components/utils/SanitizeHtml/SanitizeHtml";

export default function Hero({ data }) {
  const heroTitle = data?.title || "";
  const safeHeroTitle = sanitizeTitleHtml(heroTitle);
  const {
    desktopSrcSet,
    tabletSrcSet,
    mobileSrcSet,
    mobileSrc,
    imgProps,
    heroAlt,
    fallbackImage,
  } = useHeroResponsivePicture(data?.backgroundImage, {
    title: heroTitle,
  });

  return (
    <section data-component="Hero" className="relative flex w-full flex-col overflow-y-hidden">
      <div className="relative w-full h-screen md:h-[80vh] deprecated:max-h-[640px] md:max-h-[80vh] overflow-hidden">
        {fallbackImage?.url ? (
          <picture>
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
              className="relative z-10 h-full w-full object-cover lg:mx-auto"
            />
          </picture>
        ) : null}
        <div
          className="pointer-events-none absolute inset-0 z-20 bg-linear-to-b from-black/50 via-transparent to-transparent"
          aria-hidden="true"
        />
      </div>
      {safeHeroTitle ? (
        <FadeContent>
          <h1
            className="header-1 mx-auto pb-6 pt-6 text-center font-glosa! text-primary capitalize lg:pt-16 lg:pb-8"
            dangerouslySetInnerHTML={{ __html: safeHeroTitle }}
          />
        </FadeContent>
      ) : null}
    </section>
  );
}

Hero.propTypes = {
  data: PropTypes.shape({
    title: PropTypes.string,
    backgroundImage: PropTypes.shape({
      desktopImage: PropTypes.object,
      tabletImage: PropTypes.object,
      mobileImage: PropTypes.object,
    }),
  }),
};
