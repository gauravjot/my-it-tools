/* Router */
import {Route, Routes, BrowserRouter as Router} from "react-router-dom";
/* CSS */
import "@/assets/styles/global.css";
/* Components */
import Home from "@/pages/Home";
import PasswordGenerator from "./pages/PasswordGenerator";
import TOTPTool from "./pages/TOTPTool";
import JobApplicationTrackerTool from "./pages/JobApplicationTracker";
import ExpenseTrackerPage from "@/pages/ExpenseTracker.tsx";
import {UserType} from "./types/user";
import React, {Suspense} from "react";
import {useQuery} from "@tanstack/react-query";
import {getMe} from "./services/user/me";
import Spinner from "./components/ui/spinner/Spinner";

export const UserContext = React.createContext<UserType | null>(null);
const RichNotesPage = React.lazy(() => import("./pages/RichNotes"));

export default function App() {
	const userQuery = useQuery({
		queryKey: ["user"],
		queryFn: async () => getMe(),
		retry: false,
		refetchOnWindowFocus: false,
	});

	return (
		<UserContext.Provider value={userQuery.isSuccess ? userQuery.data : null}>
			<Router>
				<Routes>
					<Route path={"/"} element={<Home />} />
					<Route path={"/password-generator"} element={<PasswordGenerator />} />
					<Route path={"/totp-tool"} element={<TOTPTool />} />
					<Route path={"/job-application-tracker"} element={<JobApplicationTrackerTool />} />
					<Route path={"/expense-tracker"} element={<ExpenseTrackerPage />} />
					<Route
						path={"/rich-notes"}
						element={
							<Suspense
								fallback={
									<div className="fixed inset-0 size-full flex gap-4 place-items-center justify-center">
										<Spinner size="md" color="gray" />
										<p className="inline-block bg-black/5 border border-gray-300 px-2 py-0.5 rounded-md text-bb">
											Loading page...
										</p>
									</div>
								}
							>
								<RichNotesPage />
							</Suspense>
						}
					/>
					<Route
						path="/rich-notes/:noteid"
						element={
							<Suspense
								fallback={
									<div className="fixed inset-0 size-full flex gap-4 place-items-center justify-center">
										<Spinner size="md" color="gray" />
										<p className="inline-block bg-black/5 border border-gray-300 px-2 py-0.5 rounded-md text-bb">
											Loading page...
										</p>
									</div>
								}
							>
								<RichNotesPage />
							</Suspense>
						}
					/>
				</Routes>
			</Router>
		</UserContext.Provider>
	);
}
