import {links} from "@/features/Sidebar";
import BaseSidebarLayout from "./_layout";
import {Link} from "react-router-dom";

export default function Home() {
	return (
		<BaseSidebarLayout title="My IT tools">
			<div className="max-w-3xl mx-4 xl:mx-auto lg:mt-12">
				<h1 className="text-2xl font-bold tracking-tight mt-4 mb-3">Welcome to My IT tools</h1>
				<p className="text-muted-foreground">Select a tool to get started.</p>
				<div className="flex place-items-center flex-wrap gap-4 my-5">
					{links.map((link) => (
						<Link
							key={link.to}
							to={link.to}
							className={
								"flex text-sm bg-background font-medium gap-2 place-items-center text-zinc-800 dark:text-zinc-100 px-4 py-3 hover:outline hover:outline-1 hover:outline-zinc-600 dark:hover:outline-zinc-400 rounded-md hover:no-underline"
							}
						>
							{link.icon}
							{link.name}
						</Link>
					))}
				</div>
				<p className="text-muted-foreground mt-8 mb-3 text-sm">
					The tools do not save any data on servers unless they explicity require you to sign-in to
					use them. Data is locally stored in your browser instead.
				</p>
			</div>
		</BaseSidebarLayout>
	);
}
