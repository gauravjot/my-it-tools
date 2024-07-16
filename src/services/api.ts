import axios from "axios";
import { BACKEND_ENDPOINT } from "@/config";

/**
 * API call that returns a promise
 * @param token Some auth token
 * @param id some identifier
 * @returns Promise
 *
 * @see https://tanstack.com/query/v3/docs/react/overview
 */
export function getPosts(id: string) {
	return axios
		.get(BACKEND_ENDPOINT + "/posts/" + id, {
			headers: {
				"Content-Type": "application/json",
			},
		})
		.then((res) => {
			return res.data;
		});
}
