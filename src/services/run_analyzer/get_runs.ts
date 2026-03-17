import {BACKEND_ENDPOINT} from "@/config";
import {RunType} from "@/types/run_analyzer/run";
import axios from "axios";

export async function getRunList() {
	return await axios
		.get(BACKEND_ENDPOINT + "/api/run_analyzer/all/", {
			headers: {
				"Content-Type": "application/json",
			},
			withCredentials: true,
		})
		.then(function (response) {
			return response.data.runs as RunType[];
		});
}
