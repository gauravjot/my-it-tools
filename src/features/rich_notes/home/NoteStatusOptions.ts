import {SavingState} from "./NoteStatusIndicator";

export const NOTE_STATUS: {[key: string]: SavingState} = {
	saving: {
		icon: "ic-cloud",
		color: "bg-slate-800",
		message: "Saving",
	},
	saved: {
		icon: "ic-cloud-done",
		color: "bg-green-800",
		message: "Saved",
	},
	created: {
		icon: "ic-cloud-done",
		color: "bg-sky-600",
		message: "Created",
	},
	failed: {
		icon: "ic-cloud-fail",
		color: "bg-orange-700",
		message: "Saving failed",
	},
	typing: {
		icon: "ic-edit",
		color: "bg-slate-800",
		message: "Typing...",
	},
};
