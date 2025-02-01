import {BACKEND_ENDPOINT} from "@/config";
import {NoteListType} from "@/types/rich_notes/note";
import axios from "axios";

export async function getNoteList() {
	return await axios
		.get(BACKEND_ENDPOINT + "/api/rich_notes/all/", {
			headers: {
				"Content-Type": "application/json",
			},
			withCredentials: true,
		})
		.then(function (response) {
			return response.data.notes.reverse() as NoteListType;
		});
}
