import React from "react";
import BaseSidebarLayout from "@/pages/_layout.tsx";
import {DateRange} from "react-day-picker";
import DateRangePicker from "@/features/expense_tracker/DateRangePicker.tsx";
import {useQuery} from "@tanstack/react-query";
import {getIncomes} from "@/services/expense_tracker/get_incomes";
import {format, parse} from "date-fns";
import {getExpenses} from "@/services/expense_tracker/get_expenses";
import {ExpenseType, IncomeType} from "@/types/expense_tracker";

export default function ExpenseTrackerPage() {
	const today = new Date();
	// Get the first day of the current month
	const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
	// Get the last day of the current month
	const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
	const [date, setDate] = React.useState<DateRange | undefined>({
		from: firstDay,
		to: lastDay,
	});
	const incomeQuery = useQuery({
		queryKey: ["income", date],
		queryFn: async () =>
			date && date.from && date.to
				? await getIncomes(format(date.from, "yyyy-MM-dd"), format(date.to, "yyyy-MM-dd"))
				: await Promise.reject("Invalid date range"),
	});
	const netIncome = incomeQuery.isSuccess
		? incomeQuery.data.reduce((total, income) => total + income.amount, 0)
		: 0;
	const lastIncome =
		incomeQuery.isSuccess && incomeQuery.data.length > 0 ? incomeQuery.data[0] : null;
	const expenseQuery = useQuery({
		queryKey: ["expense", date],
		queryFn: async () =>
			date && date.from && date.to
				? await getExpenses(format(date.from, "yyyy-MM-dd"), format(date.to, "yyyy-MM-dd"))
				: await Promise.reject("Invalid date range"),
	});
	const netExpense = expenseQuery.isSuccess
		? expenseQuery.data.reduce((total, expense) => total + expense.amount, 0)
		: 0;
	const upcomingExpenses = expenseQuery.isSuccess
		? expenseQuery.data
				.filter((expense) => parse(expense.date, "yyyy-MM-dd", new Date()) > today)
				.reverse()
		: [];
	const nextExpense = upcomingExpenses && upcomingExpenses.length > 0 ? upcomingExpenses[0] : null;

	return (
		<BaseSidebarLayout title={"Expense Tracker"}>
			<div className="max-w-6xl mx-auto p-8 my-4 lg:my-8 bg-white shadow-md dark:bg-zinc-900 rounded-xl">
				<div className="flex justify-between place-items-center mb-4">
					<h1 className="font-bold text-2xl tracking-tight">Summary</h1>
					<DateRangePicker date={date} setDate={setDate} />
				</div>
				<div className="grid grid-cols-4 my-8 px-2">
					<div>
						<div className="text-green-600 font-bold mb-1">Income</div>
						<div>
							<span className="text-2xl tracking-tight font-medium">
								{formateCurrency(netIncome)}
							</span>
							<span className="text-muted-foreground align-top ms-1">$</span>
							<div className="text-sm text-muted-foreground truncate">
								{lastIncome ? `Latest +$${formateCurrency(lastIncome.amount)}` : "No incomes"}
							</div>
						</div>
					</div>
					<div>
						<div className="text-red-600 font-bold mb-1">Net Expense</div>
						<div>
							<span className="text-2xl tracking-tight font-medium">
								{formateCurrency(netExpense)}
							</span>
							<span className="text-muted-foreground align-top ms-1">$</span>
						</div>
						<div className="text-sm text-muted-foreground truncate">
							{expenseQuery.isSuccess ? `${expenseQuery.data.length} expenses` : "No expenses"}
						</div>
					</div>
					<div>
						<div className="text-purple-600 font-bold mb-1">Money Left</div>
						<div>
							<span className="text-2xl tracking-tight font-medium">
								{formateCurrency(netIncome - netExpense)}
							</span>
							<span className="text-muted-foreground align-top ms-1">$</span>
						</div>
					</div>
					<div>
						<div className="text-orange-500 font-bold mb-1">Upcoming Expense</div>
						<div>
							<span className="text-2xl tracking-tight font-medium">
								{formateCurrency(nextExpense ? nextExpense.amount : 0)}
							</span>
							<span className="text-muted-foreground align-top ms-1">$</span>
							<div className="text-sm text-muted-foreground truncate">
								{nextExpense ? nextExpense.name : "No expenses"}
							</div>
						</div>
					</div>
				</div>
				<div className="font-medium text-2xl mb-6 mt-8 tracking-tight">Tracker Enteries</div>
				<div className="divide-y">
					{incomeQuery.isSuccess && expenseQuery.isSuccess ? (
						[...incomeQuery.data, ...expenseQuery.data]
							.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
							.map((entry: IncomeType | ExpenseType) => (
								<div key={entry.id} className="py-3">
									<div className="grid grid-cols-3">
										<div className="leading-5">
											<div
												className={
													((entry as ExpenseType).tags != undefined
														? "text-foreground"
														: "text-green-700") + " font-medium"
												}
											>
												{entry.name ?? "No name"}
											</div>
											<div className="text-muted-foreground text-sm">
												{(entry as ExpenseType).tags != undefined ? "Expense" : "Income"}
											</div>
										</div>
										<div
											className={
												((entry as ExpenseType).tags != undefined
													? "text-foreground"
													: "text-green-700") + " flex place-items-center"
											}
										>
											${formateCurrency(entry.amount)}
										</div>
										<div className="text-muted-foreground text-sm flex place-items-center justify-end">
											{format(parse(entry.date, "yyyy-MM-dd", new Date()), "MMM d, yyyy")}
										</div>
									</div>
								</div>
							))
					) : (
						<div className="text-muted-foreground">Loading...</div>
					)}
				</div>
			</div>
		</BaseSidebarLayout>
	);
}

function formateCurrency(value: number) {
	return value.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}
