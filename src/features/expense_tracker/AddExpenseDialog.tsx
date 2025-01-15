import * as z from "zod";
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "@/components/ui/use-toast";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {Form, FormField, FormItem, FormLabel, FormControl, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {cn} from "@/lib/utils";
import {Calendar} from "@/components/ui/calendar";
import {DialogClose} from "@radix-ui/react-dialog";
import {DateRange} from "react-day-picker";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useRef} from "react";
import {Button} from "@/components/ui/button";
import {format} from "date-fns";
import {CalendarIcon} from "lucide-react";
import {addExpense} from "@/services/expense_tracker/add_expense";
import {Checkbox} from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import TagInput from "@/components/ui/custom/tag-input";

const schema = z.object({
	name: z.string().min(1).max(255),
	amount: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().min(0)),
	date: z.date(),
	repeat: z.boolean(),
	repeat_interval: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
	repeat_till: z.date().optional(),
	tags: z.array(z.string().min(1).max(255)).optional(),
});

export default function AddExpenseDialog({
	children,
	dateRange,
}: {
	children: React.ReactNode;
	dateRange: DateRange | undefined;
}) {
	const queryClient = useQueryClient();
	const cancelBtn = useRef<HTMLButtonElement>(null);
	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			date: new Date(),
			repeat: false,
			repeat_interval: "monthly",
		},
		mode: "all",
	});
	const onSubmit: SubmitHandler<z.infer<typeof schema>> = (data) => {
		console.log(data);
		addExpenseMutation.mutate(data);
	};

	const addExpenseMutation = useMutation({
		mutationKey: ["addExpense"],
		mutationFn: async (data: z.infer<typeof schema>) =>
			await addExpense({
				name: data.name,
				amount: data.amount,
				date: format(data.date, "yyyy-MM-dd"),
				repeat: data.repeat,
				repeat_interval: data.repeat_interval,
				repeat_till: data.repeat_till ? format(data.repeat_till, "yyyy-MM-dd") : undefined,
				tags: data.tags ?? [],
			}),
		onSuccess: () => {
			form.reset();
			// Close the dialog
			cancelBtn.current?.click();
			// Show success toast
			toast({
				description: "Expense added!",
			});
			// reset query
			queryClient.invalidateQueries({queryKey: ["expense", dateRange]});
		},
		onError: (error) => {
			toast({
				description: error instanceof Error ? error.message : "An error occurred",
				variant: "destructive",
			});
		},
	});

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent
				className="sm:max-w-[425px]"
				onInteractOutside={(e) => {
					e.preventDefault();
				}}
			>
				<DialogHeader>
					<DialogTitle>Add Expense</DialogTitle>
					<DialogDescription>
						Add a new expense to your tracker. This will be added to your expense list
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
						<FormField
							control={form.control}
							name="name"
							render={({field}) => (
								<FormItem>
									<FormLabel>Source</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="grid grid-cols-2 gap-3 pb-2">
							<FormField
								control={form.control}
								name="amount"
								render={({field}) => (
									<FormItem>
										<FormLabel>Amount</FormLabel>
										<FormControl>
											<Input step="0.01" type="number" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="date"
								render={({field}) => (
									<FormItem className="flex flex-col mt-2">
										<FormLabel>Date</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn(
															"w-full pl-3 text-left font-normal",
															!field.value && "text-muted-foreground"
														)}
													>
														{field.value ? (
															format(field.value, "MMM dd, yyyy")
														) : (
															<span>Pick a date</span>
														)}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name="tags"
							render={({field}) => (
								<FormItem className="flex flex-col items-start">
									<FormLabel className="text-left">Tags</FormLabel>
									<TagInput setValue={field.onChange} />
									<FormControl></FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="space-y-4 border rounded p-2 bg-gray-400/10">
							<FormField
								control={form.control}
								name="repeat"
								render={({field}) => (
									<FormItem className="flex flex-row items-start space-x-3 space-y-0">
										<FormControl>
											<Checkbox checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
										<div className="space-y-1 leading-none">
											<FormLabel>Recurring Expense</FormLabel>
										</div>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="repeat_interval"
								render={({field}) => (
									<FormItem>
										<FormLabel>Repeat</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select frequency" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="daily">Daily</SelectItem>
												<SelectItem value="weekly">Weekly</SelectItem>
												<SelectItem value="monthly">Monthly</SelectItem>
												<SelectItem value="yearly">Yearly</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="repeat_till"
								render={({field}) => (
									<FormItem className="flex flex-col mt-2">
										<FormLabel>Repeat Until</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn(
															"w-full pl-3 text-left font-normal",
															!field.value && "text-muted-foreground"
														)}
													>
														{field.value ? (
															format(field.value, "MMM dd, yyyy")
														) : (
															<span>Pick a date</span>
														)}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<DialogFooter>
							<Button type="submit" className="mt-2">
								Add Expense
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
