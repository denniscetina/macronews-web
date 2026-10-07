"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

function normalizeImages(images = []) {
	if (!Array.isArray(images)) {
		return [];
	}

	return images
		.filter((image) => image && typeof image.url === "string" && image.url.trim())
		.map((image, index) => ({
			...image,
			id: image.id ?? image.ID ?? `room-gallery-${index}`,
		}));
}

function GalleryItem({ image, onClick, className, sizes }) {
	return (
		<button
			type="button"
			onClick={() => onClick(image)}
			className={`cursor-pointer group relative w-full overflow-hidden ${className}`}
			aria-label={`Open image ${image.alt || image.title || "Room photo"}`}
		>
			<Image
				src={image.url}
				alt={image.alt || image.title || "Room photo"}
				fill
				sizes={sizes}
				className="object-cover transition-transform duration-300 group-hover:scale-105"
			/>
		</button>
	);
}

export default function Gallery({ images = [], labels = {} }) {
	const { closeGalleryPreview = "Close gallery preview" } = labels;
	const galleryImages = useMemo(() => normalizeImages(images), [images]);
	const displayImages = useMemo(() => {
		if (galleryImages.length === 0) {
			return [];
		}

		if (galleryImages.length >= 4) {
			return galleryImages;
		}

		const firstImage = galleryImages[0];
		const paddedImages = [...galleryImages];

		while (paddedImages.length < 4) {
			paddedImages.push({
				...firstImage,
				id: `${firstImage.id}-fallback-${paddedImages.length}`,
			});
		}

		return paddedImages;
	}, [galleryImages]);
	const [selectedImage, setSelectedImage] = useState(null);

	useEffect(() => {
		if (!selectedImage) {
			return undefined;
		}

		const originalOverflow = document.body.style.overflow;
		const onKeyDown = (event) => {
			if (event.key === "Escape") {
				setSelectedImage(null);
			}
		};

		document.body.style.overflow = "hidden";
		window.addEventListener("keydown", onKeyDown);

		return () => {
			document.body.style.overflow = originalOverflow;
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [selectedImage]);

	if (displayImages.length === 0) {
		return null;
	}

	const firstImage = displayImages[0];
	const rightImages = displayImages.slice(1, 4);

	return (
		<>
			<div className="w-full max-w-[1280px]">
				{rightImages.length === 0 ? (
					<GalleryItem
						image={firstImage}
						onClick={setSelectedImage}
						className="aspect-[16/10]"
						sizes="(max-width: 768px) 100vw, 1280px"
					/>
				) : (
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
						<GalleryItem
							image={firstImage}
							onClick={setSelectedImage}
							className="aspect-[16/10] md:h-full md:min-h-[420px]"
							sizes="(max-width: 768px) 100vw, 66vw"
						/>

						<div className="grid grid-cols-2 gap-3 md:gap-4">
							{rightImages[0] ? (
								<GalleryItem
									image={rightImages[0]}
									onClick={setSelectedImage}
									className="aspect-[16/10]"
									sizes="(max-width: 768px) 50vw, 22vw"
								/>
							) : null}

							{rightImages[1] ? (
								<GalleryItem
									image={rightImages[1]}
									onClick={setSelectedImage}
									className="aspect-[16/10]"
									sizes="(max-width: 768px) 50vw, 22vw"
								/>
							) : null}

							{rightImages[2] ? (
								<GalleryItem
									image={rightImages[2]}
									onClick={setSelectedImage}
									className="col-span-2 aspect-[16/7]"
									sizes="(max-width: 768px) 100vw, 44vw"
								/>
							) : null}
						</div>
					</div>
				)}
			</div>

			{selectedImage ? (
				<div
					className="fixed inset-0 z-[120] bg-black/80 p-4 md:p-8"
					onClick={() => setSelectedImage(null)}
					role="dialog"
					aria-modal="true"
				>
					<div className="relative mx-auto flex h-full w-full max-w-6xl items-center justify-center">
						<div
							className="relative h-full max-h-[88vh] w-full"
							onClick={(event) => event.stopPropagation()}
						>
							<button
								type="button"
								onClick={() => setSelectedImage(null)}
								className="cursor-pointer absolute right-8 top-10 z-10 rounded-full bg-black/45 px-3 py-1 text-white transition hover:bg-black/65"
								aria-label={closeGalleryPreview}
							>
								x
							</button>
							<Image
								src={selectedImage.url}
								alt={selectedImage.alt || selectedImage.title || "Room photo"}
								fill
								sizes="100vw"
								className="object-contain"
								priority
							/>
						</div>
					</div>
				</div>
			) : null}
		</>
	);
}
