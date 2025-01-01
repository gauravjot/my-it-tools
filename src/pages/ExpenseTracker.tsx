import React, {useContext} from "react";
import BaseSidebarLayout from "@/pages/_layout.tsx";
import {DateRange} from "react-day-picker";
import DateRangePicker from "@/features/expense_tracker/DateRangePicker.tsx";
import {useQuery} from "@tanstack/react-query";
import {getIncomes} from "@/services/expense_tracker/get_incomes";
import {format, parse} from "date-fns";
import {getExpenses} from "@/services/expense_tracker/get_expenses";
import {ExpenseType, IncomeType} from "@/types/expense_tracker";
import {UserContext} from "@/App";
import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import AddIncomeDialog from "@/features/expense_tracker/AddIncomeDialog";
import AddExpenseDialog from "@/features/expense_tracker/AddExpenseDialog";

export default function ExpenseTrackerPage() {
	const user = useContext(UserContext);

	// Get the current date
	const today = new Date();
	// Get the first day of the current month
	const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
	// Get the last day of the current month
	const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
	const [date, setDate] = React.useState<DateRange | undefined>({
		from: firstDay,
		to: lastDay,
	});

	// Income Query
	const incomeQuery = useQuery({
		queryKey: ["income", date],
		queryFn: async () =>
			user && date && date.from && date.to
				? await getIncomes(format(date.from, "yyyy-MM-dd"), format(date.to, "yyyy-MM-dd"))
				: await Promise.reject("Invalid date range"),
	});
	const netIncome = incomeQuery.isSuccess
		? incomeQuery.data.reduce((total, income) => total + income.amount, 0)
		: 0;
	const lastIncome =
		incomeQuery.isSuccess && incomeQuery.data.length > 0 ? incomeQuery.data[0] : null;

	// Expense Query
	const expenseQuery = useQuery({
		queryKey: ["expense", date],
		queryFn: async () =>
			user && date && date.from && date.to
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
			<div className="lg:mx-6 flex justify-center relative z-0">
				{user === null && (
					<div className="absolute z-0 inset-0 bg-background/70 backdrop-blur-sm">
						<div className="flex flex-col items-center justify-center h-full">
							<h1 className="text-xl font-semibold">Please login to use this tool</h1>
							<p className="text-secondary-foreground text-sm">
								Use the sidebar or navigation menu to go to login page.
							</p>
						</div>
					</div>
				)}
				<div className="max-w-6xl w-full p-4 md:p-8 lg:my-8 bg-white shadow-md dark:bg-zinc-900 lg:rounded-xl">
					<div className="flex flex-col gap-2 md:flex-row justify-between place-items-center mb-4">
						<h1 className="font-bold text-2xl tracking-tight">Summary</h1>
						<DateRangePicker date={date} setDate={setDate} />
					</div>
					<div className="grid grid-cols-2 gap-6 md:grid-cols-4 mt-8 mb-10">
						<div>
							<div className="text-green-600 dark:text-green-400 md:text-base text-sm font-bold mb-1">
								Income
							</div>
							<div>
								<span className="text-xl md:text-2xl tracking-tight font-medium">
									{formateCurrency(netIncome)}
								</span>
								<span className="text-muted-foreground align-top ms-1">$</span>
								<div className="text-sm text-muted-foreground truncate">
									{lastIncome ? `Latest +$${formateCurrency(lastIncome.amount)}` : "No incomes"}
								</div>
							</div>
						</div>
						<div>
							<div className="text-red-600 dark:text-red-400 md:text-base text-sm font-bold mb-1 leading-5">
								Net Expense
							</div>
							<div>
								<span className="text-xl md:text-2xl tracking-tight font-medium">
									{formateCurrency(netExpense)}
								</span>
								<span className="text-muted-foreground align-top ms-1">$</span>
							</div>
							<div className="text-sm text-muted-foreground truncate">
								{expenseQuery.isSuccess ? `${expenseQuery.data.length} expenses` : "No expenses"}
							</div>
						</div>
						<div>
							<div className="text-purple-600 dark:text-purple-400 md:text-base text-sm font-bold mb-1 leading-5">
								Money Left
							</div>
							<div>
								<span className="text-xl md:text-2xl tracking-tight font-medium">
									{formateCurrency(netIncome - netExpense)}
								</span>
								<span className="text-muted-foreground align-top ms-1">$</span>
							</div>
						</div>
						<div>
							<div className="text-orange-500 dark:text-orange-400 md:text-base text-sm font-bold mb-1 leading-5">
								Upcoming Expense
							</div>
							<div>
								<span className="text-xl md:text-2xl tracking-tight font-medium">
									{formateCurrency(nextExpense ? nextExpense.amount : 0)}
								</span>
								<span className="text-muted-foreground align-top ms-1">$</span>
								<div className="text-sm text-muted-foreground truncate">
									{nextExpense ? nextExpense.name : "No expenses"}
								</div>
							</div>
						</div>
					</div>
					<div className="font-medium text-2xl mb-6 mt-8 tracking-tight flex flex-col md:flex-row gap-2 justify-between">
						<div>Tracker Enteries</div>
						<div className="space-x-2">
							<AddIncomeDialog dateRange={date}>
								<Button size={"sm"} variant={"secondary"}>
									<Plus size={16} />
									&nbsp;Income
								</Button>
							</AddIncomeDialog>
							<AddExpenseDialog dateRange={date}>
								<Button size={"sm"} variant={"secondary"}>
									<Plus size={16} />
									&nbsp;Expense
								</Button>
							</AddExpenseDialog>
						</div>
					</div>
					<div className="divide-y">
						{incomeQuery.isSuccess && expenseQuery.isSuccess ? (
							incomeQuery.data.length + expenseQuery.data.length > 0 ? (
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
																: "text-green-700 dark:text-green-400") + " font-medium truncate"
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
															: "text-green-700 dark:text-green-400") + " flex place-items-center"
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
								<div className="text-muted-foreground">
									No entries found for selected date range.
								</div>
							)
						) : (
							<div className="text-muted-foreground">Loading...</div>
						)}
					</div>
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
