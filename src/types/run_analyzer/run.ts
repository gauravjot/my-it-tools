import {CalculatedInterval} from "@/lib/tcx-js/interval";
import {Lap} from "@/lib/tcx-js/laps";
import {Activity} from "@/lib/tcx-js/tcx";

export interface RunType {
	id: string;
	title: string;
	distance: number;
	time_start: Date;
	time_end: Date;
	is_interval: boolean;
	tcx: Activity | null;
	intervals: CalculatedInterval[] | null;
	laps: Lap[] | null;
}
