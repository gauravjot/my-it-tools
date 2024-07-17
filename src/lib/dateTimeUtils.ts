export function datePretty(dt: string) {
	const x = new Date(dt);
	const dd = x.getDate();
	const yy = x.getFullYear();
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