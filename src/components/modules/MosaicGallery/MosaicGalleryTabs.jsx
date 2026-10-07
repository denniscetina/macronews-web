"use client";
import Tabs from "@/components/utils/Tabs"
import {useMemo} from "react";
export default function MosaicGalleryTabs({ listTabs, contentTabs}){

	const tabs = useMemo(() => listTabs, []);

	const content = useMemo(() => contentTabs, []);
	return(
		<>
			<div className="inner-container">
				<Tabs listtabs={tabs} contentTabs={content} />
			</div>
		</>
	)
}