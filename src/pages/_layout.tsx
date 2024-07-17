import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/features/Sidebar";
import React from "react";
import { Helmet } from "react-helmet";

export default function BaseSidebarLayout(props: {title: string; children: React.ReactNode}) {
    return (<>
        <Helmet>
            <title>{props.title}</title>
        </Helmet>
        <div className="flex relative w-full">
            <div 
                className={"lg:min-w-72 lg:border-r lg:dark:border-zinc-800 lg:h-screen lg:max-h-screen lg:overflow-y-auto lg:sticky lg:top-0 lg:left-0" + 
                            " fixed top-0 w-full"}
            >
                <Sidebar />
            </div>
            <div className="flex-1">
                {props.children}
            </div>
            <Toaster />
        </div>
    </>);
}