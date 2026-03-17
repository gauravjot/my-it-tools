import {BACKEND_ENDPOINT} from "@/config";
import {RunType} from "@/types/run_analyzer/run";
import axios from "axios";

export async function getRun(run_id: string) {
	return await axios
		.get(BACKEND_ENDPOINT + `/api/run_analyzer/${run_id}/`, {
			headers: {
				"Content-Type": "application/json",
			},
			withCredentials: true,
		})
		.then(function (response) {
			const run = response.data.run as RunType;
			run.tcx = response.data.tcx;
			return run;
		});
}
