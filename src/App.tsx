/* Router */
import {Route, Routes, BrowserRouter as Router} from "react-router-dom";
/* CSS */
import "@/assets/styles/global.css";
/* Components */
import Home from "@/pages/Home";

export default function App() {
	return (
		<Router>
			<Routes>
				<Route path={"/"} element={<Home />} />
			</Routes>
		</Router>
	);
}
