import {BACKEND_ENDPOINT} from "@/config";
import axios from "axios";

export interface UpdateNoteTitleType {
	title: string;
}

/**
 *
 * @param {string} note_id
 * @param {UpdateNoteTitleType} payload
 * @returns {Promise<any>}
 */
export async function updateNoteTitle(note_id: string, payload: UpdateNoteTitleType) {
	return await axios
		.put(
			BACKEND_ENDPOINT + "/api/rich_notes/" + note_id + "/edit/title/",
			JSON.stringify(payload),
			{
				headers: {
					"Content-Type": "application/json",
				},
				withCredentials: true,
			}
		)
		.then(function (response) {
			return response.data;
		});
}
