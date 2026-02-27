import {IntervalType} from "@/pages/RunAnalyzer";
import {Trackpoint} from "./tcx";

export interface CalculatedInterval {
	interval: IntervalType;
	firstTrackpoint: Trackpoint;
	lastTrackpoint: Trackpoint;
	firstTrackpointIndex: number;
	lastTrackpointIndex: number;
	avgHeartRate: number;
	avgSpeed: number;
	avgPace: string;
	distanceCovered: number;
	maxHeartRate: number;
}

export function findIntervals(
	trackpoints: Trackpoint[],
	intervals: IntervalType[],
	trackpointStartIndex: number,
): CalculatedInterval[] | null {
	const intervalTimeSpans: number[] = [];
	const recoveryTimeSpans: number[] = [];
	const repeatTimesTotal: number = intervals.reduce((max, interval) => {
		return max + ((interval.repeatTimes === 0 ? 1 : interval.repeatTimes) || 1);
	}, 0);

	for (let i = 0; i < intervals.length; i++) {
		for (let j = 0; j < (intervals[i].repeatTimes || 1); j++) {
			intervalTimeSpans.push(intervals[i].time || 0); // push all individual interval time spans based on repeat times
			recoveryTimeSpans.push(
				j + 1 === (intervals[i].repeatTimes || 1) &&
					i + 1 < intervals.length &&
					intervals[i + 1].recoveryTimeAtStart !== undefined
					? intervals[i + 1].recoveryTimeAtStart || 0
					: intervals[i].recoveryTime || 0,
			);
		}
	}

	// Starting from trackpoint 1, we have to find the trackpoint starting from which the avg pace is the highest
	// for the given interval time span. It should then be followed by set recovery time span. This should be repeated for the given repeat times and the interval with the highest avg pace should be returned.

	const possibleIntervals: CalculatedInterval[] = [];
	for (let i = trackpointStartIndex; i < trackpoints.length; i++) {
		const epoch_start = trackpoints[i].epoch_ms;
		const possibleFirstTrackpoint = trackpoints[i];
		// The last trackpoint needs to be atleast intervalTimeSpan into the future
		let possibleLastTrackpoint = trackpoints.find(
			(tp) => tp.epoch_ms - epoch_start >= intervalTimeSpans[0] * 1000,
		);
		if (!possibleLastTrackpoint) {
			possibleLastTrackpoint = trackpoints[trackpoints.length - 1];
		}

		const avgSpeed =
			trackpoints
				.slice(i, trackpoints.indexOf(possibleLastTrackpoint) + 1)
				.reduce((acc, tp) => acc + (tp.speed || 0), 0) /
			(trackpoints.indexOf(possibleLastTrackpoint) - i + 1);

		const avgHeartRate =
			trackpoints
				.slice(i, trackpoints.indexOf(possibleLastTrackpoint) + 1)
				.reduce((acc, tp) => acc + (tp.heart_rate_bpm || 0), 0) /
			(trackpoints.indexOf(possibleLastTrackpoint) - i + 1);

		const decimalMinutes = 60 / (avgSpeed * 3.6);
		const mins = Math.floor(decimalMinutes);
		const secs = Math.round((decimalMinutes - mins) * 60);
		const avgPace = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

		let distanceCovered =
			(possibleLastTrackpoint.distance_meters || 0) -
			(possibleFirstTrackpoint.distance_meters || 0);
		if (distanceCovered < 0) {
			distanceCovered = 0; // Handle cases where distance might decrease due to GPS errors
		}

		const maxHeartRate = trackpoints
			.slice(i, trackpoints.indexOf(possibleLastTrackpoint) + 1)
			.reduce((max, tp) => {
				return tp.heart_rate_bpm && tp.heart_rate_bpm > max ? tp.heart_rate_bpm : max;
			}, 0);

		possibleIntervals.push({
			interval: intervals[0],
			firstTrackpoint: possibleFirstTrackpoint,
			lastTrackpoint: possibleLastTrackpoint,
			firstTrackpointIndex: i,
			lastTrackpointIndex: trackpoints.indexOf(possibleLastTrackpoint),
			avgHeartRate,
			avgSpeed,
			avgPace,
			distanceCovered,
			maxHeartRate,
		});
	}

	// Pair intervals with respect to recovery time span
	const pairedIntervals: CalculatedInterval[][] = [];
	for (let i = 0; i < possibleIntervals.length; i++) {
		const currentPair: CalculatedInterval[] = [possibleIntervals[i]];
		let currentInterval = i;
		for (let j = 1; j < repeatTimesTotal; j++) {
			const nextInterval = possibleIntervals
				.slice(currentInterval + j, possibleIntervals.length)
				.find(
					(interval) =>
						interval.firstTrackpoint.epoch_ms -
							possibleIntervals[currentInterval].lastTrackpoint.epoch_ms >=
						recoveryTimeSpans[j - 1] * 1000,
				);
			if (nextInterval) {
				currentPair.push(nextInterval);
				currentInterval = possibleIntervals.indexOf(nextInterval);
			}
		}
		if (currentPair.length === repeatTimesTotal) {
			pairedIntervals.push(currentPair);
		}
	}

	// Now get pairedInterval that has highest sum of distanceCovered
	pairedIntervals.sort((a, b) => {
		const distanceA = a.reduce((acc, interval) => acc + interval.distanceCovered, 0);
		const distanceB = b.reduce((acc, interval) => acc + interval.distanceCovered, 0);
		return distanceB - distanceA; // Sort in descending order
	});

	return pairedIntervals[0] || null;
}

export function speedToPace(speed: number): string {
	const decimalMinutes = 60 / (speed * 3.6);
	const mins = Math.floor(decimalMinutes);
	const secs = Math.round((decimalMinutes - mins) * 60);
	return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
