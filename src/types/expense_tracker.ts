export interface IncomeType {
	id: string;
	name: string;
	amount: number;
	date: string;
	added_at: string;
	user: string;
}

export interface ExpenseType {
	id: string;
	name: string;
	amount: number;
	date: string;
	added_at: string;
	user: string;
	tags: ExpenseTagType[];
	repeat: boolean;
	repeat_interval: string;
}

export interface ExpenseTagType {
	id: string;
	name: string;
	expense_id: string;
	user: string;
}
