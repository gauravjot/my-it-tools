import {BACKEND_ENDPOINT} from "@/config";
import {SlateDocumentType} from "@/lib/rich_notes_utils";
import {NoteType} from "@/types/rich_notes/api";
import axios from "axios";

export interface CreateNoteType {
	title: string;
	content: SlateDocumentType;
}

/**
 *
 * @param {string} note_id
 * @param {CreateNoteType} payload
 * @returns {Promise<NoteType>}
 */
export async function createNote(payload: CreateNoteType) {
	return await axios
		.post(BACKEND_ENDPOINT + "/api/rich_notes/create/", JSON.stringify(payload), {
			headers: {
				"Content-Type": "application/json",
			},
			withCredentials: true,
		})
		.then(function (response) {
			return response.data as NoteType;
		});
}
