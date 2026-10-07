import BlurredImage from "@/components/utils/BlurredImage";

const getTilePatternClass = (index, total) => {
  if (total === 3) {
    if (index === 0) {
      return "md:col-start-1 md:col-end-3 md:row-span-2 md:min-h-[560px]";
    }
    return "";
  }

  if (total === 6) {
    if (index === 0) {
      return "md:col-start-1 md:col-end-3 md:row-span-2 md:min-h-[560px]";
    }
    if (index === 1) {
      return "md:col-start-3 md:row-start-1";
    }
    if (index === 2) {
      return "md:col-start-3 md:row-start-2";
    }
    return "";
  }

  if (total >= 7) {
    if (index % 6 === 0) {
      return "md:col-span-2 md:row-span-2 md:min-h-[560px]";
    }
    if (index % 6 === 3) {
      return "md:col-span-2";
    }
  }

  return "";
};

export default function GridGallery({ data }) {
  if (!data || data.length === 0) {
    return null;
  }

  const total = data.length;
  const gridClassName =
    "grid w-full grid-cols-1 gap-4 p-4 md:grid-cols-3 md:auto-rows-[280px] md:grid-flow-dense";
  const tileBaseClassName = "relative w-full min-h-[200px] overflow-hidden rounded-lg";
  const imageClassName =
    "h-full w-full cursor-pointer object-cover transition-transform duration-300 hover:scale-105";

  return (
    <div className={gridClassName}>
      {data.map((item, idx) => (
        <div
          key={`${item?.url || "gallery-item"}-${idx}`}
          className={`${tileBaseClassName} ${getTilePatternClass(idx, total)}`}
        >
          <BlurredImage
            src={item.url}
            alt={item.alt || `Gallery item ${idx + 1}`}
            fill
            className={imageClassName}
          />
        </div>
      ))}
    </div>
  );
};