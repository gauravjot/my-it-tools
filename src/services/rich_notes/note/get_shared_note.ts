import {BACKEND_ENDPOINT} from "@/config";
import {SharedNoteType} from "@/types/rich_notes/note";
import axios from "axios";

export async function getSharedNote(shareid: string, password: string) {
	return await axios
		.post(
			BACKEND_ENDPOINT + "/api/rich_notes/shared/" + shareid + "/",
			JSON.stringify({password: password}),
			{
				headers: {
					"Content-Type": "application/json",
				},
			}
		)
		.then(function (response) {
			return response.data.data as SharedNoteType;
		});
}
