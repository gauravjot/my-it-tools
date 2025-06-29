export function getCookie(cname: string): string | null {
	const name: string = cname + "=";
	const decodedCookie: string = decodeURIComponent(document.cookie);
	const ca: string[] = decodedCookie.split(";");
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == " ") {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}
