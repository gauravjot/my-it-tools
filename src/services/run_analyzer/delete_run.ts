import {BACKEND_ENDPOINT} from "@/config";
import axios from "axios";

export async function deleteRun(run_id: string) {
	return await axios.delete(BACKEND_ENDPOINT + `/api/run_analyzer/${run_id}/delete/`, {
		headers: {
			"Content-Type": "application/json",
		},
		withCredentials: true,
	});
}
