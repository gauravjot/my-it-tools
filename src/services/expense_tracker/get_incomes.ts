import axios from "axios";
import {BACKEND_ENDPOINT} from "@/config";
import {IncomeType} from "@/types/expense_tracker.ts";

/**
 * Get all incomes between two dates (inclusive)
 * @param date_start YYYY-MM-DD
 * @param date_end YYYY-MM-DD
 */
export async function getIncomes(date_start: string, date_end: string) {
	return await axios
		.get(BACKEND_ENDPOINT + `/api/expense_tracker/get_incomes/${date_start}/${date_end}/`, {
			headers: {
				"Content-Type": "application/json",
			},
			withCredentials: true,
		})
		.then((res) => {
			return res.data as IncomeType[];
		});
}
