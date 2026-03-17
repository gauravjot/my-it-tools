import {BACKEND_ENDPOINT} from "@/config";
import {RunType} from "@/types/run_analyzer/run";
import axios from "axios";

export interface CreateRunType {
	title: string;
	distance: number;
	time_start: Date;
	time_end: Date;
	is_interval: boolean;
	tcx: unknown;
	intervals: unknown;
	laps: unknown;
}

/**
 *
 * @param {string} note_id
 * @param {CreateRunType} payload
 * @returns {Promise<NoteType>}
 */
export async function createRun(payload: CreateRunType) {
	return await axios
		.post(BACKEND_ENDPOINT + "/api/run_analyzer/add/", JSON.stringify(payload), {
			headers: {
				"Content-Type": "application/json",
			},
			withCredentials: true,
		})
		.then(function (response) {
			return response.data as RunType;
		});
}
