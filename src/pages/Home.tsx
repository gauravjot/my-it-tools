import Sidebar from "@/features/Sidebar";
import { Helmet } from "react-helmet";

export default function Home() {

	return (
		<>
			<Helmet>
				<title>My IT Tools</title>
			</Helmet>
			<div className="flex relative">
				<div className="min-w-72 border-r dark:border-zinc-800 h-screen max-h-screen overflow-y-auto static">
					<Sidebar />
				</div>
				<div className="max-w-lg mx-auto h-screen flex place-items-center">
					
				</div>
			</div>
		</>
	);
}
