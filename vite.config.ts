import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	base: 'my-it-tools/',
	plugins: [react()],
	resolve: {
		alias: [{ find: "@", replacement: "/src" }],
	},
});
