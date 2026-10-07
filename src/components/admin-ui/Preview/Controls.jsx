import FixedDraftMode from "@/components/utils/FixedDraftMode";
import MobileDeviceIcon from "@/components/icons/MobileDevice";
import TabletDeviceIcon from "@/components/icons/TabletDevice";
import DesktopDeviceIcon from "@/components/icons/DesktopDevice";
import clsx from "clsx";
import ExternalLink from "@/components/icons/ExternalLink";
import PreviewModeSignal from "@/components/admin-ui/Preview/PreviewModeSignal";
import DisablePreviewModeAction from "@/components/admin-ui/Preview/DisablePreviewModeAction";

export default function Controls({
									 activeViewport = "desktop",
									 getViewportHref,
									 openPageLabel = "Open page",
									 targetPath = "/",
									 viewports = {},
								 }) {
	return (
		<>
			<header
				className="grid grid-cols-1 md:grid-cols-3 items-center justify-center md:justify-between gap-4 rounded-xl border border-zinc-300 bg-white px-4 py-3 shadow-sm">
				<div className="flex items-center justify-center md:justify-start">
					<PreviewModeSignal/>
				</div>
				<div className="flex items-center justify-center gap-4">
					{Object.entries(viewports).map(([viewport, config]) => {
						const isActive = viewport === activeViewport;
						const href =
							typeof getViewportHref === "function"
								? getViewportHref(viewport)
								: targetPath;

						return (
							<a
								key={viewport}
								href={href}
								className="flex flex-col gap-1 items-center justify-center"
							>
								{viewport === "mobile" ? <MobileDeviceIcon
									className={clsx(isActive ? "text-black" : "text-zinc-400")}/> : null}
								{viewport === "tablet" ? <TabletDeviceIcon
									className={clsx(isActive ? "text-black" : "text-zinc-400!")}/> : null}
								{viewport === "desktop" ? <DesktopDeviceIcon
									className={clsx(isActive ? "text-black" : "text-zinc-400")}/> : null}
								<span className={
									clsx("text-[10px]", isActive ? "font-medium text-black" : "font-normal text-zinc-400")
								}>
									{config.label}
								</span>
							</a>
						);
					})}
				</div>
				<div className="flex flex-row items-center justify-center md:justify-end gap-2">
					<div className="border-r border-zinc-300 px-2 flex items-center gap-4">
						<a
							href={targetPath}
							target="_blank"
							rel="noreferrer"
							className="flex flex-row items-center gap-1"
						>
							<ExternalLink className={"text-zinc-400"} size={16}/>
							<span className="text-xs">
								{openPageLabel}
							</span>
						</a>
					</div>
					<DisablePreviewModeAction/>
				</div>
			</header>
		</>
	);
}
