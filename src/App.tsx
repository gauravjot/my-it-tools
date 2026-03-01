/* Router */
import {Route, Routes, BrowserRouter as Router} from "react-router-dom";
/* CSS */
import "@/assets/styles/global.css";
/* Components */
import Home from "@/pages/Home";
import {UserType} from "./types/user";
import React, {Suspense} from "react";
import {useQuery} from "@tanstack/react-query";
import {getMe} from "./services/user/me";
import Spinner from "./components/ui/spinner/Spinner";

export const UserContext = React.createContext<UserType | null>(null);
const PasswordGenerator = React.lazy(() => import("./pages/PasswordGenerator"));
const TOTPTool = React.lazy(() => import("./pages/TOTPTool"));
const RichNotesPage = React.lazy(() => import("./pages/RichNotes"));
const RichNotesSharedPage = React.lazy(() => import("./pages/RichNotesSharedPage"));
const ExpenseTrackerPage = React.lazy(() => import("./pages/ExpenseTracker"));
const JobApplicationTrackerTool = React.lazy(() => import("./pages/JobApplicationTracker"));
const RunAnalyzerPage = React.lazy(() => import("./pages/RunAnalyzer"));
const KanbanPage = React.lazy(() => import("./pages/Kanban"));

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
					<Route
						path={"/kanban"}
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
								<KanbanPage />
							</Suspense>
						}
					/>
					<Route
						path={"/run-analyzer"}
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
								<RunAnalyzerPage />
							</Suspense>
						}
					/>
					<Route path={"/index"} element={<Home />} />
					<Route
						path={"/password-generator"}
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
								<PasswordGenerator />
							</Suspense>
						}
					/>
					<Route
						path={"/totp-tool"}
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
								<TOTPTool />
							</Suspense>
						}
					/>
					<Route
						path={"/job-application-tracker"}
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
								<JobApplicationTrackerTool />
							</Suspense>
						}
					/>
					<Route
						path={"/expense-tracker"}
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
								<ExpenseTrackerPage />
							</Suspense>
						}
					/>
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
					<Route
						path="/rich-notes/shared/:shareid"
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
								<RichNotesSharedPage />
							</Suspense>
						}
					/>
				</Routes>
			</Router>
		</UserContext.Provider>
	);
}
