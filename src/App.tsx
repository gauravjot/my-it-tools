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

export default function App() {
	return (
		<Router>
			<Routes>
				<Route path={"/"} element={<Home />} />
				<Route path={"/password-generator"} element={<PasswordGenerator />} />
				<Route path={"/totp-tool"} element={<TOTPTool />} />
				<Route path={"/job-application-tracker"} element={<JobApplicationTrackerTool />} />
				<Route path={"/expense-tracker"} element={<ExpenseTrackerPage />} />
			</Routes>
		</Router>
	);
}
