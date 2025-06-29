import {CloudCheck, CloudAlert, CircleDashed, Cloud, FileCheck2} from "lucide-react";

export interface SavingState {
	Icon: JSX.Element; // icon can be a string for class names or a JSX element
	color: "bg-slate-800" | "bg-green-800" | "bg-sky-600" | "bg-orange-700";
	message: string;
}

export const NOTE_STATUS: {[key: string]: SavingState} = {
	saving: {
		Icon: <Cloud size={16} />,
		color: "bg-slate-800",
		message: "Saving",
	},
	saved: {
		Icon: <CloudCheck size={16} />,
		color: "bg-green-800",
		message: "Saved",
	},
	created: {
		Icon: <FileCheck2 size={16} />,
		color: "bg-sky-600",
		message: "Created",
	},
	failed: {
		Icon: <CloudAlert size={16} />,
		color: "bg-orange-700",
		message: "Saving failed",
	},
	typing: {
		Icon: <CircleDashed size={16} className="animate-spin" />,
		color: "bg-slate-800",
		message: "Typing...",
	},
};
