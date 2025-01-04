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
import {addIncome} from "@/services/expense_tracker/add_income";
import {DateRange} from "react-day-picker";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useRef} from "react";
import {Button} from "@/components/ui/button";
import {format} from "date-fns";
import {CalendarIcon} from "lucide-react";

const schema = z.object({
	name: z.string().min(1).max(255),
	amount: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().min(0)),
	date: z.date(),
});

export default function AddIncomeDialog({
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
		},
		mode: "all",
	});
	const onSubmit: SubmitHandler<z.infer<typeof schema>> = (data) => {
		addIncomeMutation.mutate(data);
	};

	const addIncomeMutation = useMutation({
		mutationKey: ["addIncome"],
		mutationFn: async (data: z.infer<typeof schema>) =>
			await addIncome({
				name: data.name,
				amount: data.amount,
				date: format(data.date, "yyyy-MM-dd"),
			}),
		onSuccess: () => {
			form.reset();
			// Close the dialog
			cancelBtn.current?.click();
			// Show success toast
			toast({
				description: "Income added!",
			});
			// reset income query
			queryClient.invalidateQueries({queryKey: ["income", dateRange]});
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
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add Income</DialogTitle>
					<DialogDescription>
						Add a new income to your tracker. This will be added to your income list.
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
						<div className="grid grid-cols-2 gap-3">
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
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="secondary" ref={cancelBtn} className="mt-2">
									Cancel
								</Button>
							</DialogClose>
							<Button type="submit" className="mt-2">
								Add Income
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
