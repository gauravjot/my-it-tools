export function getRandomBgColor(input: string): string {
	const colors = [
		"bg-red-500",
		"bg-yellow-500",
		"bg-green-500",
		"bg-blue-500",
		"bg-indigo-500",
		"bg-purple-500",
		"bg-pink-500",
	];
	const index = input.length % colors.length;
	return colors[index];
}
