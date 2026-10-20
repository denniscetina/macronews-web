import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import Preview from "@/features/preview/components/Preview";
import {
	PREVIEW_VIEWPORTS,
	buildPreviewIframeSrc,
	buildPreviewViewportHref,
	cleanPreviewSegments,
	resolvePreviewTargetPath,
	resolvePreviewViewport,
} from "@/features/preview/routing";
import { getSite } from "@/server/services/site";

export default async function PreviewPage({ params, searchParams }) {
	const { slug } = await params;
	const { vp } = await searchParams;
	const segments = cleanPreviewSegments((slug ?? []).join("/"));
	const site = await getSite();
	const targetPath = resolvePreviewTargetPath(segments, site?.frontPages);

	// Without draft mode there is nothing to preview: go to the public page.
	if (!(await draftMode()).isEnabled) {
		redirect(targetPath);
	}

	const activeViewport = resolvePreviewViewport(vp);

	return (
		<Preview
			activeViewport={activeViewport}
			activeViewportWidth={PREVIEW_VIEWPORTS[activeViewport].width}
			getViewportHref={(viewport) => buildPreviewViewportHref(segments, viewport)}
			iframeSrc={buildPreviewIframeSrc(targetPath)}
			targetPath={targetPath}
			viewports={PREVIEW_VIEWPORTS}
		/>
	);
}
