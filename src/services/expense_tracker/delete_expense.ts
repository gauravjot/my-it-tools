import axios from "axios";
import {BACKEND_ENDPOINT} from "@/config";

export async function deleteExpense(id: string) {
	return await axios.delete(BACKEND_ENDPOINT + `/api/expense_tracker/expenses/${id}/delete/`, {
		headers: {
			"Content-Type": "application/json",
		},
		withCredentials: true,
	});
}
