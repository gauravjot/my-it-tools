import React from "react";
import {Activity, Parser} from "@/lib/tcx-js/tcx";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {SubmitHandler, useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {ArrowDownIcon, ArrowUpIcon, ClockPlusIcon, EqualApproximately, Trash2} from "lucide-react";
import {Label} from "@/components/ui/label";
import {CalculatedInterval, findIntervals} from "@/lib/tcx-js/interval";
import {speedToPace} from "../lib/tcx-js/interval";
import BaseSidebarLayout from "./_layout";
import {Checkbox} from "@/components/ui/checkbox";

export const interval = z.object({
	time: z.coerce.number().optional(), // in seconds
	recoveryTime: z.coerce.number().optional(), // in seconds
	repeatTimes: z.coerce.number().optional(),
	recoveryTimeAtStart: z.coerce.number().optional(), // in seconds
});

export const workout = z.object({
	isInterval: z.boolean().default(true),
	intervals: z.array(interval).default([]),
});

export type FormData = z.infer<typeof workout>;
export type IntervalType = z.infer<typeof interval>;

export default function RunAnalyzer() {
	const [parsedData, setParsedData] = React.useState<Activity | null>(null);
	const [intervals, setIntervals] = React.useState<CalculatedInterval[]>([]);
	const fileRef = React.useRef<HTMLInputElement>(null);

	const form = useForm<FormData>({
		resolver: zodResolver(workout),
		defaultValues: {
			isInterval: true,
			intervals: [],
		},
	});

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			// Handle the file processing here
			const reader = new FileReader();
			reader.onload = (e) => {
				const text = e.target?.result as string;
				try {
					const parser = new Parser(text);
					setParsedData(parser.activity);
				} catch (error) {
					console.error("Error parsing TCX file:", error);
				}
			};
			reader.readAsText(file);
		}
	};

	const onSubmit: SubmitHandler<z.infer<typeof workout>> = (data) => {
		const intervals = findIntervals(parsedData?.trackpoints || [], data.intervals, 0);
		setIntervals(intervals || []);
	};

	return (
		<BaseSidebarLayout title="Run Analyzer">
			<div className="flex flex-col xl:flex-row gap-6 xl:gap-8 mx-auto mt-4 max-w-7xl lg:mt-12 bg-background rounded-lg p-4 shadow-md">
				<div className="lg:max-w-md w-full p-2">
					<h1 className="text-2xl font-bold tracking-tight">Run Analyzer</h1>
					<p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300 mb-6">
						Provide a .tcx file from your run and specify the intervals you want to analyze. You can
						add multiple intervals with different durations and recovery times.
					</p>
					<Label className="align-text-top">Choose .tcx File</Label>
					<Input type="file" accept=".tcx" onChange={handleFileChange} ref={fileRef} />
					<div>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 mt-4">
								<FormField
									control={form.control}
									name={"isInterval"}
									render={({field}) => (
										<FormItem className="hidden">
											<FormControl>
												<Checkbox checked={field.value} onCheckedChange={field.onChange} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								{form.getValues("intervals").map((_interval, index) => (
									<div key={index}>
										{index === 0 && (
											<>
												<FormLabel>Intervals</FormLabel>
												<p className="text-sm text-muted-foreground">
													All interval durations are in seconds.
												</p>
											</>
										)}
										{index > 0 && (
											<div className="bg-accent-100 dark:bg-accent-400/15 p-2 ml-4 my-2 border border-gray-300 dark:border-accent-400/30 rounded">
												<FormField
													control={form.control}
													name={`intervals.${index}.recoveryTimeAtStart` as const}
													render={({field}) => (
														<FormItem>
															<FormLabel>Intervals In-between Recovery Time</FormLabel>
															<FormControl>
																<Input placeholder="Recovery Time" type="number" {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>
										)}
										<div className="bg-secondary dark:bg-zinc-800 p-2 my-2 border rounded border-gray-300 dark:border-zinc-500">
											<div className="flex gap-2">
												<FormField
													control={form.control}
													name={`intervals.${index}.time` as const}
													render={({field}) => (
														<FormItem>
															<FormControl>
																<Input placeholder="Duration" min={10} type="number" {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name={`intervals.${index}.recoveryTime` as const}
													render={({field}) => (
														<FormItem>
															<FormControl>
																<Input
																	placeholder="Recovery Time"
																	min={10}
																	type="number"
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<div>
													<Button
														variant={"destructiveGhost"}
														type="button"
														size="icon"
														onClick={() => {
															const intervals = form.getValues("intervals");
															intervals.splice(index, 1);
															form.setValue("intervals", intervals);
															// rerender form
															form.trigger("intervals");
														}}
													>
														<Trash2 size={16} color="red" />
													</Button>
												</div>
											</div>
											<div className="flex gap-3 mt-2 items-center">
												<div>
													<FormLabel className="align-text-top">Count</FormLabel>
												</div>
												<div className="flex-1">
													<FormField
														control={form.control}
														name={`intervals.${index}.repeatTimes` as const}
														render={({field}) => (
															<FormItem className="w-28">
																<FormControl>
																	<Input placeholder="Runs" type="number" min={1} {...field} />
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
											</div>
										</div>
									</div>
								))}
								<div className="my-2">
									<Button
										variant={"ghost"}
										type="button"
										className="w-full gap-2 justify-start border"
										onClick={() => {
											const intervals = form.getValues("intervals");
											form.setValue("intervals", [
												...intervals,
												{
													time: undefined,
													recoveryTime: undefined,
													repeatTimes: undefined,
												},
											]);
											// rerender form
											form.trigger("intervals");
										}}
									>
										<ClockPlusIcon size={16} />
										<span>Add Interval</span>
									</Button>
								</div>
								<div className="mt-4">
									<Button type="submit" variant={"accent"} className="w-full">
										Process Workout
									</Button>
								</div>
							</form>
						</Form>
					</div>
				</div>
				<div className="flex-1 w-full">
					{parsedData && (
						<div>
							<h2 className="font-bold text-xl my-4 mb-2">Run Analysis</h2>
							<div className="grid grid-cols-2 gap-1.5 justify-between lg:max-w-80">
								<div className="font-medium text-sm">Total Distance:</div>
								<div className="text-right">
									{parsedData.trackpoints[parsedData.trackpoints.length - 1].distance_km?.toFixed(
										2,
									)}{" "}
									km
								</div>
								<div className="font-medium text-sm">Time Spent:</div>
								<div className="text-right">
									{parsedData.trackpoints[parsedData.trackpoints.length - 1].elapsed_hhmmss}
								</div>
								<div className="font-medium text-sm">Average Pace:</div>
								<div className="text-right">
									{speedToPace(
										parsedData.trackpoints
											.slice()
											.reduce((acc, point) => acc + (point.speed || 0), 0) /
											parsedData.trackpoints.length,
									)}{" "}
									min/km
								</div>
							</div>
						</div>
					)}
					{intervals.length > 0 && (
						<div>
							<h2 className="font-bold text-xl mt-6 mb-2">Intervals</h2>
							<div className="grid grid-cols-4 gap-4 font-medium border-b border-gray-300 py-2 mt-2 px-2">
								<div className="text-md leading-tight">Duration</div>
								<div className="text-md leading-tight">Avg Pace</div>
								<div className="text-md leading-tight">Avg HR</div>
								<div className="text-md leading-tight">Distance</div>
							</div>
							{intervals.map((interval, index) => (
								<div key={index}>
									<IntervalRow
										interval={interval}
										previousInterval={index > 0 ? intervals[index - 1] : null}
									/>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</BaseSidebarLayout>
	);
}

function IntervalRow({
	interval,
	previousInterval,
}: {
	interval: CalculatedInterval;
	previousInterval: CalculatedInterval | null;
}) {
	const [showMore, setShowMore] = React.useState(false);

	const totalSeconds = interval.interval.time || 0;
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	// padStart adds the leading zero
	const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

	return (
		<div className="border-b border-gray-200 text-sm">
			<div
				className="grid grid-cols-4 gap-4 hover:bg-gray-200 cursor-pointer p-2"
				onClick={() => {
					setShowMore((v) => !v);
				}}
			>
				<div>{formatted}</div>
				<div className="flex gap-1 items-center">
					<span>{interval.avgPace}</span>
					{previousInterval && interval.avgSpeed > previousInterval.avgSpeed && (
						<ArrowUpIcon size={14} color="green" className="ml-1" />
					)}
					{previousInterval && interval.avgSpeed < previousInterval.avgSpeed && (
						<ArrowDownIcon size={14} color="red" className="ml-1" />
					)}
					{previousInterval === null && (
						<EqualApproximately size={14} color="gray" className="ml-1" />
					)}
				</div>
				<div>{Math.round(interval.avgHeartRate)}</div>
				<div>{Math.round(interval.distanceCovered)}m</div>
			</div>
			{showMore && (
				<div className="pl-4 pr-2 pt-2 pb-2 text-muted-foreground">
					<div className="grid grid-cols-2 gap-1">
						{interval.firstTrackpoint.time && (
							<>
								<div className="font-medium">Interval Start:</div>
								<div>{new Date(interval.firstTrackpoint.time).toLocaleString()}</div>
							</>
						)}
						{interval.lastTrackpoint.time && (
							<>
								<div className="font-medium">Interval End:</div>
								<div>{new Date(interval.lastTrackpoint.time).toLocaleString()}</div>
							</>
						)}
						<div className="font-medium">Started When Elapsed Time:</div>
						<div>{interval.firstTrackpoint.elapsed_hhmmss}</div>
						<div className="font-medium">Max Heart Rate:</div>
						<div>{interval.maxHeartRate}</div>
					</div>
				</div>
			)}
		</div>
	);
}
