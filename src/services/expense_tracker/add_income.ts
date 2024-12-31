import axios from "axios";
import {BACKEND_ENDPOINT} from "@/config";
import {IncomeType} from "@/types/expense_tracker.ts";

export interface AddIncomeRequestType {
	name: string;
	amount: number;
	date: string;
}

export async function addIncome(data: AddIncomeRequestType) {
	return await axios
		.post(BACKEND_ENDPOINT + "/api/expense_tracker/add_income/", JSON.stringify(data), {
			headers: {
				"Content-Type": "application/json",
			},
			withCredentials: true,
		})
		.then((res) => {
			return res.data as IncomeType;
		});
}
