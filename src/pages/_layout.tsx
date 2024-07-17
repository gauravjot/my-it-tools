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
            <div className="min-w-72 border-r dark:border-zinc-800 h-screen max-h-screen overflow-y-auto sticky top-0 left-0">
                <Sidebar />
            </div>
            <div className="flex-1">
                {props.children}
            </div>
            <Toaster />
        </div>
    </>);
}