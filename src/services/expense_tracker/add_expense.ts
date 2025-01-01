import axios from "axios";
import {BACKEND_ENDPOINT} from "@/config";
import {ExpenseType} from "@/types/expense_tracker.ts";

export interface AddExpenseRequestType {
	name: string;
	amount: number;
	date: string;
	repeat: boolean;
	repeat_interval?: "daily" | "weekly" | "monthly" | "yearly";
	repeat_till?: string;
	tags: string[];
}

export async function addExpense(data: AddExpenseRequestType) {
	return await axios
		.post(BACKEND_ENDPOINT + "/api/expense_tracker/add_expense/", JSON.stringify(data), {
			headers: {
				"Content-Type": "application/json",
			},
			withCredentials: true,
		})
		.then((res) => {
			return res.data as ExpenseType;
		});
}
