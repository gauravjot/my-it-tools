import {BACKEND_ENDPOINT} from "@/config";
import {ShareNote} from "@/types/rich_notes/api";
import axios from "axios";

export async function getNoteShares(note_id: string) {
	return await axios
		.get(BACKEND_ENDPOINT + "/api/rich_notes/share/links/" + note_id + "/", {
			headers: {
				"Content-Type": "application/json",
			},
			withCredentials: true,
		})
		.then(function (response) {
			return response.data as ShareNote[];
		});
}
