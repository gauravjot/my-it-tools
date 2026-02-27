import xml2js from "xml2js";

class Timestamp {
	time_str: string;
	date: Date;
	epochMilliseconds: number;

	constructor(time_str: string) {
		this.date = new Date();
		this.epochMilliseconds = 0;
		this.time_str = time_str;
		try {
			this.date = new Date(time_str);
			this.epochMilliseconds = this.date.getTime();
		} catch (e) {
			console.log(e);
		}
	}
	isValid() {
		return this.epochMilliseconds > 0;
	}
	toString() {
		return (
			"Timestamp: " +
			this.isValid() +
			", " +
			this.time_str +
			", " +
			this.date +
			", " +
			this.epochMilliseconds
		);
	}
}
class ElapsedTime {
	elapsedMs: number;
	secs: number;
	hh: number;
	mm: number;
	ss: number;

	constructor(elapsedMs: number) {
		this.secs = 0;
		this.hh = 0;
		this.mm = 0;
		this.ss = 0;
		this.elapsedMs = Math.abs(elapsedMs);
		this.secs = Math.round(this.elapsedMs / ElapsedTime.MILLISECONDS_PER_SECOND);
		this.hh = Math.floor(this.secs / ElapsedTime.SECONDS_PER_HOUR);
		const rem = this.secs - this.hh * ElapsedTime.SECONDS_PER_HOUR;
		this.mm = Math.floor(rem / 60.0);
		this.ss = rem - this.mm * 60.0;
		if (this.mm > 59) {
			console.log("ElapsedTime mm normalized to 59 - " + this.mm);
			this.mm = 59;
		}
		if (this.ss > 59) {
			console.log("ElapsedTime ss normalized to 59 - " + this.ss);
			this.ss = 59;
		}
	}
	static get MILLISECONDS_PER_SECOND() {
		return 1000.0;
	}
	static get SECONDS_PER_HOUR() {
		return 3600.0;
	}
	static get SECONDS_PER_MINUTE() {
		return 60.0;
	}
	asHHMMSS() {
		return this.zeroPad(this.hh) + ":" + this.zeroPad(this.mm) + ":" + this.zeroPad(this.ss);
	}
	zeroPad(i: number) {
		if (i < 10) {
			return "0" + i;
		} else {
			return "" + i;
		}
	}
}
class GeoJsonLocation {
	type: string;
	coordinates: number[];
	constructor(latitude: number, longitude: number) {
		this.type = "Point";
		this.coordinates = [longitude, latitude];
	}
}
class Trackpoint {
	doctype: string;
	time: string | null;
	seq: number | null;
	latitude: number | null;
	longitude: number | null;
	altitude_meters: number | null;
	altitude_feet: number | null;
	distance_meters: number | null;
	distance_miles: number | null;
	distance_km: number | null;
	distance_yds: number | null;
	heart_rate_bpm: number | null;
	speed: number | null;
	cadence: number | null;
	watts: number | null;
	location: GeoJsonLocation | null;
	elapsed_sec: number | null;
	elapsed_hhmmss: string | null;
	epoch_ms: number;

	constructor(raw_obj: any, sequence: number, prevTkpt: Trackpoint | null = null) {
		this.doctype = "trackpoint";
		this.time = null;
		this.seq = null;
		this.latitude = 0;
		this.longitude = 0;
		this.altitude_meters = null;
		this.altitude_feet = null;
		this.distance_meters = 0;
		this.distance_miles = null;
		this.distance_km = null;
		this.distance_yds = null;
		this.heart_rate_bpm = null;
		this.speed = null;
		this.cadence = null;
		this.watts = null;
		this.location = null;
		this.elapsed_sec = null;
		this.elapsed_hhmmss = null;
		this.epoch_ms = -1;
		this.seq = sequence;
		this.epoch_ms = -1;
		const keys = Object.keys(raw_obj);
		if (keys.includes("Time")) {
			this.time = raw_obj["Time"];
		} else {
			this.time = Trackpoint.DEFAULT_EPOCH_TIMESTAMP_STRING;
		}
		try {
			if (this.time !== null) {
				const ts = new Timestamp(this.time);
				this.epoch_ms = ts.epochMilliseconds;
			}
		} catch (e) {
			console.log(e);
		}
		if (keys.includes("Position")) {
			try {
				const position = raw_obj["Position"];
				this.latitude = Number(position["LatitudeDegrees"]);
				this.longitude = Number(position["LongitudeDegrees"]);
			} catch (e) {
				console.log(e);
			}
		}
		if (keys.includes("AltitudeMeters")) {
			this.altitude_meters = Number(raw_obj["AltitudeMeters"]);
		}
		if (keys.includes("DistanceMeters")) {
			this.distance_meters = Number(raw_obj["DistanceMeters"]);
		}
		if (keys.includes("HeartRateBpm")) {
			try {
				const hr = raw_obj["HeartRateBpm"];
				this.heart_rate_bpm = Number(hr["Value"]);
			} catch (e) {
				console.log(e);
			}
		}
		if (keys.includes("Cadence")) {
			this.cadence = Number(raw_obj["Cadence"]);
		}
		if (keys.includes("Extensions")) {
			try {
				let ext = raw_obj["Extensions"];
				let ext_keys = Object.keys(ext);
				if (ext_keys.includes("TPX")) {
					let tpx = ext["TPX"];
					let tpx_keys = Object.keys(tpx);
					if (tpx_keys.includes("Speed")) {
						this.speed = Number(tpx["Speed"]);
					}
					if (tpx_keys.includes("RunCadence")) {
						this.cadence = Number(tpx["RunCadence"]);
					}
					if (tpx_keys.includes("Watts")) {
						this.watts = Number(tpx["Watts"]);
					}
				}
			} catch (e) {
				console.log(e);
			}
		}
		if (this.speed === null || this.speed === undefined || this.speed === 0) {
			// calculate based on prevTkpt
			if (prevTkpt !== null && prevTkpt.distance_meters !== null) {
				let deltaDistance = this.distance_meters - prevTkpt.distance_meters;
				let deltaTimeSec = (this.epoch_ms - prevTkpt.epoch_ms) / 1000.0;
				if (deltaTimeSec > 0) {
					this.speed = deltaDistance / deltaTimeSec;
				}
			}
		}
	}
	static get DEFAULT_EPOCH_TIMESTAMP_STRING() {
		return "1970-01-01T00:00:00.000Z";
	}
	static get MILES_PER_KILOMETER() {
		return 0.621371192237334;
	}
	static get YARDS_PER_MILE() {
		return 1760.0;
	}
	static get FEET_PER_METER() {
		return 3.280839895013123;
	}
	addAltitudeFeet() {
		if (this.altitude_meters) {
			try {
				this.altitude_meters = Number(this.altitude_meters);
				this.altitude_feet = this.altitude_meters * Trackpoint.FEET_PER_METER;
			} catch (e) {
				console.log(e);
			}
		}
	}
	addDistances() {
		if (this.distance_meters !== null) {
			try {
				this.distance_km = this.distance_meters / 1000.0;
				this.distance_miles = this.distance_km * Trackpoint.MILES_PER_KILOMETER;
				this.distance_yds = this.distance_miles * Trackpoint.YARDS_PER_MILE;
			} catch (e) {
				console.log(e);
			}
		}
	}
	calculateElapsed(startingEpoch: number) {
		let elapsedMs = this.epoch_ms - startingEpoch;
		let et = new ElapsedTime(elapsedMs);
		this.elapsed_sec = et.secs;
		this.elapsed_hhmmss = et.asHHMMSS();
	}
	addGeoJson() {
		try {
			const lat = this.latitude;
			const lng = this.longitude;
			if (lat !== null && lng !== null) {
				this.location = new GeoJsonLocation(lat, lng);
			}
		} catch (e) {
			console.log(e);
		}
	}
	cleanup() {}
}
class Author {
	type: string;
	name: string;
	part_number: string;
	lang: string;
	build_major: string;
	build_minor: string;
	version_major: string;
	version_minor: string;

	constructor(raw_obj: any | null) {
		this.type = "Author";
		this.name = "";
		this.part_number = "";
		this.lang = "";
		this.build_major = "";
		this.build_minor = "";
		this.version_major = "";
		this.version_minor = "";
		if (raw_obj !== null) {
			this.name = raw_obj["Name"];
			this.lang = raw_obj["LangID"];
			this.part_number = raw_obj["PartNumber"];
			let build = raw_obj["Build"];
			let vers = build["Version"];
			this.version_major = vers["VersionMajor"];
			this.version_minor = vers["VersionMinor"];
			this.build_major = vers["BuildMajor"];
			this.build_minor = vers["BuildMinor"];
		}
	}
}
class Creator {
	type: string;
	name: string;
	product_id: string;
	unit_id: string;
	build_major: string;
	build_minor: string;
	version_major: string;
	version_minor: string;

	constructor(raw_obj: any | null) {
		this.type = "Creator";
		this.name = "";
		this.product_id = "";
		this.unit_id = "";
		this.build_major = "";
		this.build_minor = "";
		this.version_major = "";
		this.version_minor = "";
		if (raw_obj !== null) {
			this.name = raw_obj["Name"];
			this.unit_id = raw_obj["UnitId"];
			this.product_id = raw_obj["ProductID"];
			let vers = raw_obj["Version"];
			this.version_major = vers["VersionMajor"];
			this.version_minor = vers["VersionMinor"];
			this.build_major = vers["BuildMajor"];
			this.build_minor = vers["BuildMinor"];
		}
	}
}

class Activity {
	tcx_filename: string;
	activityId: string;
	sport: string;
	author: Author;
	creator: Creator;
	trackpoints: Trackpoint[];
	firstTrackpoint: Trackpoint | null;
	startingEpoch: number;
	parsedDate: string;

	constructor() {
		this.tcx_filename = "";
		this.activityId = "";
		this.sport = "";
		this.trackpoints = [];
		this.firstTrackpoint = new Trackpoint({}, 0, null);
		this.startingEpoch = 0;
		this.parsedDate = new Date().toISOString();
		this.sport = "";
		this.author = new Author(null);
		this.creator = new Creator(null);
	}
	addTrackpoint(tkpt: Trackpoint) {
		this.trackpoints.push(tkpt);
		if (this.trackpoints.length === 1) {
			this.firstTrackpoint = tkpt;
			this.startingEpoch = tkpt.epoch_ms;
		}
	}
}

class Parser {
	activity: Activity;
	tcx_filename: string;

	constructor(infile: string) {
		this.activity = new Activity();
		this.tcx_filename = "";
		this.activity.tcx_filename = "";
		const root_obj: any = this.convertXmlToJson(infile);
		let tcdb = root_obj["TrainingCenterDatabase"];
		let activities = tcdb["Activities"];
		let activity = activities["Activity"];
		this.activity.activityId = activity["Id"];
		try {
			let activityDollar = activity["$"];
			this.activity.sport = activityDollar["Sport"];
		} catch (e) {
			console.log(e);
		}
		try {
			let author_data = tcdb["Author"];
			this.activity.author = new Author(author_data);
		} catch (e) {}
		try {
			let creator_data = activity["Creator"];
			this.activity.creator = new Creator(creator_data);
		} catch (e) {}
		let lapObj = activity["Lap"];
		let tkpt_seq = 0;
		if (Array.isArray(lapObj)) {
			let laps = activity["Lap"];
			let lap_count = laps.length;
			for (var i = 0; i < lap_count; i++) {
				let curr_lap = laps[i];
				let curr_track = curr_lap["Track"];
				let curr_tkpts = curr_track["Trackpoint"];
				let curr_tkpt_length = curr_tkpts.length;
				for (var t = 0; t < curr_tkpt_length; t++) {
					tkpt_seq++;
					let tkpt_data = curr_tkpts[t];
					this.activity.addTrackpoint(
						new Trackpoint(
							tkpt_data,
							tkpt_seq,
							this.activity.trackpoints[this.activity.trackpoints.length - 1],
						),
					);
				}
			}
		} else {
			let curr_lap = lapObj;
			let curr_track = curr_lap["Track"];
			let curr_tkpts = curr_track["Trackpoint"];
			let curr_tkpt_length = curr_tkpts.length;
			for (var t = 0; t < curr_tkpt_length; t++) {
				tkpt_seq++;
				let tkpt_data = curr_tkpts[t];
				this.activity.addTrackpoint(
					new Trackpoint(
						tkpt_data,
						tkpt_seq,
						this.activity.trackpoints[this.activity.trackpoints.length - 1],
					),
				);
			}
		}
		let startingEpoch = this.activity.startingEpoch;
		for (let i = 0; i < this.activity.trackpoints.length; i++) {
			this.activity.trackpoints[i].addAltitudeFeet();
			this.activity.trackpoints[i].addDistances();
			this.activity.trackpoints[i].calculateElapsed(startingEpoch);
			this.activity.trackpoints[i].addGeoJson();
			this.activity.trackpoints[i].cleanup();
		}
		this.activity.firstTrackpoint = null;
	}
	static get VERSION() {
		return "1.0.1";
	}
	convertXmlToJson(data: string) {
		let res = {};
		xml2js.parseString(data, {explicitArray: false}, (error, result) => {
			if (error) {
				throw error;
			} else {
				res = result;
			}
		});
		return res;
	}
	finish() {}
}

export {Parser, Activity, Author, Creator, Trackpoint, GeoJsonLocation, ElapsedTime, Timestamp};
