import {speedToPace} from "./interval";
import {Trackpoint} from "./tcx";

export interface Lap {
	sequence: number;
	startTme: string;
	totalTime: number;
	distance_km: number;
	avgSpeed: number;
	avgPace: string;
	maxSpeed: number;
	avgHeartRateBpm: number;
	maxHeartRateBpm: number;
	trackpoints: Trackpoint[];
}

export function getLaps(trackpoints: Trackpoint[]): Lap[] {
	// Split the trackpoints into 1km laps based on distance_km
	const laps: Lap[] = [];
	let currentLap: Lap | null = null;

	for (const trackpoint of trackpoints) {
		if (!currentLap) {
			currentLap = {
				sequence: laps.length,
				startTme: new Date(trackpoint.epoch_ms).toISOString(),
				totalTime: 0,
				distance_km: 0,
				avgSpeed: trackpoint.speed || 0,
				maxSpeed: trackpoint.speed || 0,
				avgHeartRateBpm: trackpoint.heart_rate_bpm || 0,
				maxHeartRateBpm: trackpoint.heart_rate_bpm || 0,
				avgPace: "00:00",
				trackpoints: [trackpoint],
			};
		} else {
			currentLap.trackpoints.push(trackpoint);
			currentLap.distance_km =
				(trackpoint.distance_km || 0) - (currentLap.trackpoints[0].distance_km || 0);
			currentLap.avgSpeed =
				currentLap.trackpoints.reduce((acc, tp) => acc + (tp.speed || 0), 0) /
				currentLap.trackpoints.length;
			currentLap.maxSpeed = Math.max(currentLap.maxSpeed, trackpoint.speed || 0);
			currentLap.avgHeartRateBpm =
				currentLap.trackpoints.reduce((acc, tp) => acc + (tp.heart_rate_bpm || 0), 0) /
				currentLap.trackpoints.length;
			currentLap.maxHeartRateBpm = Math.max(
				currentLap.maxHeartRateBpm,
				trackpoint.heart_rate_bpm || 0,
			);
			currentLap.avgPace = speedToPace(currentLap.avgSpeed);
		}

		if (currentLap.distance_km >= 1) {
			laps.push(currentLap);
			currentLap = null;
		}
		// if it is the last trackpoint and we have a current lap, we need to push it to laps
		if (trackpoint === trackpoints[trackpoints.length - 1] && currentLap) {
			laps.push(currentLap);
		}
	}
	return laps;
}
