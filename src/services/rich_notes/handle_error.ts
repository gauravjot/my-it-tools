import axios, { AxiosError } from "axios";

export function handleApiError(err: Error | AxiosError) {
	if (axios.isAxiosError(err)) {
		return {
			success: false,
			res: {
				statusCode:
					err.response?.data?.code ??
					err.response?.status.toString() ??
					"Unknown",
				message:
					err.response?.data?.message ?? err.response?.statusText ?? "Unknown",
			},
		};
	} else {
		return {
			success: false,
			res: {
				statusCode: "Unknown",
				message: "Unknown",
			},
		};
	}
}
