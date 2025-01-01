import axios from "axios";
import {BACKEND_ENDPOINT} from "@/config";
import {UserType} from "@/types/user";

/**
 * Get current logged in user
 */
export async function getMe() {
	return await axios
		.get(BACKEND_ENDPOINT + `/api/user/me/`, {
			headers: {
				"Content-Type": "application/json",
			},
			withCredentials: true,
		})
		.then((res) => {
			return res.data.user as UserType;
		});
}
