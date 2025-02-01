import {BACKEND_ENDPOINT} from "@/config";
import axios from "axios";

/**
 *
 * @param {string} note_id
 * @param {DeleteNoteType} payload
 * @returns {Promise<NoteType>}
 */
export async function deleteNote(note_id: string) {
	return await axios
		.delete(BACKEND_ENDPOINT + "/api/rich_notes/" + note_id + "/", {
			headers: {
				"Content-Type": "application/json",
			},
			withCredentials: true,
		})
		.then(function (response) {
			return response.data;
		});
}
