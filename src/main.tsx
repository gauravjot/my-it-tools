import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ThemeProvider} from "./components/theme-provider";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider defaultTheme="light" storageKey="ui-theme">
				<App />
			</ThemeProvider>
		</QueryClientProvider>
	</React.StrictMode>,
);
