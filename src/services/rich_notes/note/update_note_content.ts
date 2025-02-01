import {BACKEND_ENDPOINT} from "@/config";
import {SlateDocumentType} from "@/lib/rich_notes_utils";
import {NoteType} from "@/types/rich_notes/api";
import axios from "axios";

export interface UpdateNoteContentType {
	content: SlateDocumentType;
	note_id: string;
}

/**
 *
 * @param {UpdateNoteContentType} payload
 * @returns {Promise<NoteType>}
 */
export async function updateNoteContent(payload: UpdateNoteContentType) {
	return await axios
		.put(BACKEND_ENDPOINT + "/api/rich_notes/" + payload.note_id + "/", JSON.stringify(payload), {
			headers: {
				"Content-Type": "application/json",
			},
			withCredentials: true,
		})
		.then(function (response) {
			return response.data as NoteType;
		});
}
