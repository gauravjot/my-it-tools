import {AxiosError} from "axios";
import {Dispatch, SetStateAction} from "react";

export interface ErrorType {
	code: string;
	title: string;
	detail: string;
	instance: string;
}

export function handleAxiosError(
	error: AxiosError,
	setReqError: Dispatch<SetStateAction<string | null>>
) {
	const msg = error.response?.data;
	try {
		const res = msg as ErrorType;
		setReqError(
			JSON.stringify(res.title).replaceAll('"', "").replaceAll("\\n", "\n") + " [" + res.code + "]"
		);
	} catch (err) {
		setReqError(JSON.stringify(error.message).replaceAll('"', ""));
	}
}
