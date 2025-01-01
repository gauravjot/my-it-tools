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
import React from "react";
import {useQuery} from "@tanstack/react-query";
import {getMe} from "./services/user/me";

export const UserContext = React.createContext<UserType | null>(null);

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
				</Routes>
			</Router>
		</UserContext.Provider>
	);
}
