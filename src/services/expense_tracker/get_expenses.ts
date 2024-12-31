import axios from "axios";
import {BACKEND_ENDPOINT} from "@/config";
import {ExpenseType} from "@/types/expense_tracker";

/**
 * Get all expenses between two dates (inclusive)
 * @param date_start YYYY-MM-DD
 * @param date_end YYYY-MM-DD
 */
export async function getExpenses(date_start: string, date_end: string) {
	return await axios
		.get(BACKEND_ENDPOINT + `/api/expense_tracker/get_expenses/${date_start}/${date_end}/`, {
			headers: {
				"Content-Type": "application/json",
			},
			withCredentials: true,
		})
		.then((res) => {
			return res.data as ExpenseType[];
		});
}
