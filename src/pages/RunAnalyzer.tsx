import React from "react";
import {Activity, Parser} from "@/lib/tcx-js/tcx";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {SubmitHandler, useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	ChevronRight,
	ClockPlusIcon,
	EqualApproximately,
	Trash2,
	XIcon,
} from "lucide-react";
import {Label} from "@/components/ui/label";
import {CalculatedInterval, findIntervals} from "@/lib/tcx-js/interval";
import {speedToPace} from "../lib/tcx-js/interval";
import BaseSidebarLayout from "./_layout";
import {Checkbox} from "@/components/ui/checkbox";
import {getLaps, Lap} from "@/lib/tcx-js/laps";

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
	const [calculatedIntervals, setCalculatedIntervals] = React.useState<CalculatedInterval[]>([]);
	const [calculateLaps, setCalculateLaps] = React.useState<Lap[]>([]);
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
					const laps = getLaps(parser.activity.trackpoints || []);
					console.log(laps);
					setCalculateLaps(laps);
				} catch (error) {
					console.error("Error parsing TCX file:", error);
				}
			};
			reader.readAsText(file);
		}
	};

	const onSubmit: SubmitHandler<z.infer<typeof workout>> = (data) => {
		const intervals = findIntervals(parsedData?.trackpoints || [], data.intervals, 0);
		console.log(JSON.stringify(intervals, null, 2));
		setCalculatedIntervals(intervals || []);
	};

	return (
		<BaseSidebarLayout title="Run Analyzer">
			<div className="mx-auto mt-4 max-w-7xl lg:mt-12">
				<div className="flex flex-col xl:flex-row gap-6 xl:gap-8 bg-white dark:bg-zinc-900 rounded-lg p-4 shadow-md m-4">
					<div className="xl:max-w-sm w-full">
						<h1 className="text-2xl font-bold tracking-tight">Run Analyzer</h1>
						<p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300 mb-6">
							Provide a .tcx file from your run and specify the intervals you want to analyze. You
							can add multiple intervals with different durations and recovery times.
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
												<div className="p-2 my-2">
													<FormField
														control={form.control}
														name={`intervals.${index}.recoveryTimeAtStart` as const}
														render={({field}) => (
															<FormItem>
																<FormLabel>Intervals In-between Recovery Time</FormLabel>
																<FormControl>
																	<Input
																		placeholder="Recovery Time"
																		className="!mt-1"
																		type="number"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
											)}
											<div className="bg-secondary dark:bg-zinc-800 p-2 my-2 border rounded border-gray-300 dark:border-zinc-500">
												<div className="relative">
													<div className="flex gap-2 items-end">
														<FormField
															control={form.control}
															name={`intervals.${index}.repeatTimes` as const}
															render={({field}) => (
																<FormItem className="w-24">
																	<FormLabel>Count</FormLabel>
																	<FormControl>
																		<Input
																			className="!mt-1 min-w-24"
																			placeholder="Runs"
																			type="number"
																			min={1}
																			{...field}
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
														<XIcon size={16} className="text-muted-foreground mb-3" />
														<FormField
															control={form.control}
															name={`intervals.${index}.time` as const}
															render={({field}) => (
																<FormItem>
																	<FormLabel>Duration</FormLabel>
																	<FormControl>
																		<Input
																			placeholder="Duration"
																			className="!mt-1"
																			min={10}
																			type="number"
																			{...field}
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>
													<Button
														variant={"destructiveGhost"}
														type="button"
														size="icon"
														className="absolute size-8 -right-6 -top-6 bg-background hover:bg-red-200 dark:hover:bg-red-950 rounded-full border"
														onClick={() => {
															const intervals = form.getValues("intervals");
															intervals.splice(index, 1);
															form.setValue("intervals", intervals);
															// rerender form
															form.trigger("intervals");
														}}
													>
														<Trash2 size={16} />
													</Button>
												</div>
												{(form.watch(`intervals.${index}.repeatTimes`) || 1) > 1 && (
													<div className="flex gap-3 mt-2 items-center">
														<div>
															<FormLabel className="align-text-top">Recovery Time</FormLabel>
														</div>
														<div className="flex-1">
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
																				disabled={
																					(form.getValues("intervals")[index].repeatTimes || 1) < 1
																				}
																				{...field}
																			/>
																		</FormControl>
																		<FormMessage />
																	</FormItem>
																)}
															/>
														</div>
													</div>
												)}
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
														recoveryTimeAtStart:
															intervals.length > 0
																? intervals[intervals.length - 1].recoveryTime
																: undefined,
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
								<h2 className="font-bold text-xl mt-4 xl:mt-2 mb-4">Run Analysis</h2>
								<div className="md:grid md:grid-cols-2 gap-4">
									<div>
										<div className="font-medium text-sm">Total Distance:</div>
										<div className="mb-3">
											{parsedData.trackpoints[
												parsedData.trackpoints.length - 1
											].distance_km?.toFixed(2)}{" "}
											km
										</div>
										<div className="font-medium text-sm">Time Spent:</div>
										<div className="mb-3">
											{parsedData.trackpoints[parsedData.trackpoints.length - 1].elapsed_hhmmss}
										</div>
										<div className="font-medium text-sm">Average Pace:</div>
										<div className="mb-3">
											{speedToPace(
												parsedData.trackpoints
													.slice()
													.reduce((acc, point) => acc + (point.speed || 0), 0) /
													parsedData.trackpoints.length,
											)}{" "}
											min/km
										</div>
										<div className="font-medium text-sm">Average Heart Rate:</div>
										<div className="mb-3">
											{Math.round(
												parsedData.trackpoints
													.slice()
													.reduce((acc, point) => acc + (point.heart_rate_bpm || 0), 0) /
													parsedData.trackpoints.length,
											)}{" "}
											bpm
										</div>
									</div>
									<div>
										<div>
											{calculateLaps.length > 0 && (
												<div className="grid grid-cols-7 gap-2 mt-2">
													<div className="contents text-muted-foreground text-sm font-medium">
														<div>Lap #</div>
														<div className="col-span-2">Distance</div>
														<div className="col-span-2">Avg Pace</div>
														<div className="col-span-2">Avg HR</div>
													</div>
													{calculateLaps.map((lap, index) => (
														<div key={index} className="contents text-md leading-tight">
															<div>{index + 1}</div>
															<div className="col-span-2">{lap.distance_km.toFixed(2)} km</div>
															<div className="col-span-2">{lap.avgPace}</div>
															<div className="col-span-2">{Math.round(lap.avgHeartRateBpm)}</div>
														</div>
													))}
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						)}
						{calculatedIntervals.length > 0 ? (
							<div>
								<h2 className="font-bold text-xl mt-6 mb-4">Intervals</h2>
								<div className="grid grid-cols-7 gap-3 font-medium border-b border-gray-300 dark:border-zinc-600 py-2 mt-2 px-2">
									<div className="flex col-span-2">
										<div className="text-md leading-tight w-10">#</div>
										<div className="text-md leading-tight">Duration</div>
									</div>
									<div className="text-md leading-tight col-span-2">Avg Pace</div>
									<div className="text-md leading-tight">Avg HR</div>
									<div className="text-md leading-tight col-span-2">Distance</div>
								</div>
								{calculatedIntervals.map((interval, index) => (
									<div key={index}>
										<IntervalRow
											index={index}
											interval={interval}
											previousInterval={index > 0 ? calculatedIntervals[index - 1] : null}
										/>
									</div>
								))}
							</div>
						) : (
							<p className="text-sm text-muted-foreground mt-4">No intervals calculated yet.</p>
						)}
					</div>
				</div>
			</div>
		</BaseSidebarLayout>
	);
}

function IntervalRow({
	index,
	interval,
	previousInterval,
}: {
	index: number;
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
		<div className="border-b border-gray-200 dark:border-zinc-700 text-sm">
			<div
				className="grid grid-cols-7 gap-3 hover:bg-gray-200 dark:hover:bg-zinc-800 cursor-pointer p-2"
				onClick={() => {
					setShowMore((v) => !v);
				}}
			>
				<div className="flex col-span-2">
					<div className="w-10 text-muted-foreground">{index + 1}</div>
					<div>{formatted}</div>
				</div>
				<div className="flex gap-1 items-center col-span-2">
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
				<div className="flex items-center justify-between col-span-2">
					<span>{Math.round(interval.distanceCovered)}m</span>
					<ChevronRight
						size={14}
						color="gray"
						className={`ml-1 ${showMore ? "rotate-90" : ""} transition-all`}
					/>
				</div>
			</div>
			{showMore && (
				<div className="pl-12 pr-2 pt-2 pb-2 text-muted-foreground">
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
