export function datePretty(dt: string) {
	const x = new Date(dt);
	const dd = x.getDate();
	const yy = x.getFullYear();
	const monthNames = [
		"Jan",
		"Feb",
		"March",
		"April",
		"May",
		"June",
		"July",
		"Aug",
		"Sept",
		"Oct",
		"Nov",
		"Dec",
	];
	return monthNames[x.getMonth()] + " " + dd + ", " + yy;
}

export function timePretty(dt: string) {
	const x = new Date(dt);
	return (
		("0" + (x.getHours() > 12 ? x.getHours() - 12 : x.getHours())).slice(-2) +
		":" +
		("0" + x.getMinutes()).slice(-2) +
		(x.getHours() > 12 ? "pm" : "am")
	);
}

/**
 *
 * @param dt - Date string `2022-11-02T23:15:14.327407Z`
 * @returns string - `November 5, 2022 at 01:00pm`
 */
export function dateTimePretty(dt: string) {
	return datePretty(dt) + " at " + timePretty(dt);
}

export function timeSince(timestamp: string) {
	const diff = Date.now() - Date.parse(timestamp);

	const seconds = diff / 1000;

	let interval = seconds / 31536000;

	if (interval > 1) {
		return Math.floor(interval) + " year" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
	}
	interval = seconds / 2592000;
	if (interval > 1) {
		return Math.floor(interval) + " month" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
	}
	interval = seconds / 86400;
	if (interval > 1) {
		return Math.floor(interval) + " day" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
	}
	interval = seconds / 3600;
	if (interval > 1) {
		return Math.floor(interval) + " hour" + (Math.floor(interval) > 1 ? "s" : "") + " ago ";
	}
	interval = seconds / 60;
	if (interval > 1) {
		return Math.floor(interval) + " min" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
	}
	if (Math.floor(seconds) < 2) {
		return "just now";
	}
	return Math.floor(seconds) + " sec" + (Math.floor(seconds) > 1 ? "s" : "") + " ago";
}

export function monthYear(dt: string) {
	// 2022-11-02T23:15:14.327407Z
	const monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	const x = new Date(dt);
	// let dd = x.getDate();
	const mm = monthNames[x.getMonth()];
	const yy = x.getFullYear();
	return mm + " " + yy;
}
