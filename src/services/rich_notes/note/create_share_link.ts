import {BACKEND_ENDPOINT} from "@/config";
import {ShareNote} from "@/types/rich_notes/api";
import axios from "axios";

export interface ShareNoteQueryType {
	title: string;
	anonymous: boolean;
	active: boolean;
	password: string | null;
}

interface ShareNoteCreateType extends ShareNote {
	urlkey: string;
	isPasswordProtected: boolean;
}

/**
 *
 * @param {string} note_id
 * @param {ShareNoteQueryType} payload
 * @returns {Promise<NoteType>}
 */
export async function shareNoteQuery(note_id: string, payload: ShareNoteQueryType) {
	return await axios
		.post(BACKEND_ENDPOINT + "/api/rich_notes/share/" + note_id + "/", JSON.stringify(payload), {
			headers: {
				"Content-Type": "application/json",
			},
			withCredentials: true,
		})
		.then(function (response) {
			return response.data.data as ShareNoteCreateType;
		});
}
