import {DateRange} from "react-day-picker";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Calendar} from "@/components/ui/calendar";
import {CalendarIcon} from "lucide-react";
import {format} from "date-fns";
import {cn} from "@/lib/utils.ts";
import React from "react";

export default function DateRangePicker({
	date,
	setDate,
}: {
	date: DateRange | undefined;
	setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					id="date"
					variant={"outline"}
					className={cn(
						"w-[250px] justify-start gap-3 place-items-center text-left bg-white dark:bg-black font-normal",
						!date && "text-muted-foreground",
					)}
				>
					<CalendarIcon size={18} />
					{date?.from ? (
						date.to ? (
							<>
								{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
							</>
						) : (
							format(date.from, "LLL dd, y")
						)
					) : (
						<span>Pick a date</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					initialFocus
					mode="range"
					defaultMonth={date?.from}
					selected={date}
					onSelect={setDate}
					numberOfMonths={2}
				/>
			</PopoverContent>
		</Popover>
	);
}
