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
	setReqError?: Dispatch<SetStateAction<string | null>>
): string | void {
	const msg = error.response?.data;
	try {
		const res = msg as ErrorType;
		const err =
			JSON.stringify(res.title).replaceAll('"', "").replaceAll("\\n", "\n") + " [" + res.code + "]";
		if (setReqError) {
			setReqError(err);
		} else {
			return err;
		}
	} catch (err) {
		if (setReqError) {
			setReqError(JSON.stringify(error.message).replaceAll('"', ""));
		}
		return JSON.stringify(error.message).replaceAll('"', "");
	}
}
