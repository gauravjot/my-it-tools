import {Toaster} from "@/components/ui/toaster";
import Sidebar from "@/features/Sidebar";
import React from "react";
import {Helmet} from "react-helmet";

export default function BaseSidebarLayout(props: {title: string; children: React.ReactNode}) {
	return (
		<>
			<Helmet>
				<title>{props.title}</title>
			</Helmet>
			<div className="relative w-full lg:flex">
				<div
					className={
						"lg:w-72 lg:border-r lg:dark:border-zinc-800 h-16 lg:h-screen lg:max-h-screen lg:overflow-y-auto sticky lg:top-0 lg:left-0" +
						" top-0 left-0 w-full z-50"
					}
				>
					<Sidebar />
				</div>
				<div className="flex-1">{props.children}</div>
				<Toaster />
			</div>
		</>
	);
}
