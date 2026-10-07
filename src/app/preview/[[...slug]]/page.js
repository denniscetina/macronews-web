import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import Preview from "@/components/admin-ui/Preview";
import {
	PREVIEW_VIEWPORTS,
	buildPreviewIframeSrc,
	buildPreviewViewportHref,
	getPreviewSlugSegments,
	resolvePreviewTargetPath,
	resolvePreviewViewport,
} from "@/lib/preview/routing";

export default async function PreviewShellPage({ params, searchParams }) {
	const { isEnabled } = await draftMode();
	const resolvedParams = await params;
	const resolvedSearchParams = await searchParams;
	const slugPath = getPreviewSlugSegments(resolvedParams?.slug).join("/");
	const targetPath = resolvePreviewTargetPath(slugPath);

	if (!isEnabled) {
		redirect(targetPath);
	}

	const activeViewport = resolvePreviewViewport(resolvedSearchParams?.vp);
	const activeViewportWidth = PREVIEW_VIEWPORTS[activeViewport].width;

	return (
		<Preview
			activeViewport={activeViewport}
			activeViewportWidth={activeViewportWidth}
			getViewportHref={(viewport) =>
				buildPreviewViewportHref({ slugPath, viewport })
			}
			iframeSrc={buildPreviewIframeSrc(targetPath)}
			targetPath={targetPath}
			viewports={PREVIEW_VIEWPORTS}
		/>
	);
}
