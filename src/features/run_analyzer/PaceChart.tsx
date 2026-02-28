import {speedToPace} from "@/lib/tcx-js/interval";
import {
	Chart as ChartJS,
	CategoryScale,
	TimeSeriesScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Filler,
	TooltipItem,
} from "chart.js";
import {Line} from "react-chartjs-2";
import annotationPlugin from "chartjs-plugin-annotation";
import "chartjs-adapter-date-fns";

ChartJS.register(
	CategoryScale,
	TimeSeriesScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Filler,
	annotationPlugin,
);

const smoothData = (data: number[], windowSize = 3) => {
	return data.map((_val, i, arr) => {
		// Get the window of points
		const start = Math.max(0, i - Math.floor(windowSize / 2));
		const end = Math.min(arr.length, i + Math.ceil(windowSize / 2));
		const window = arr.slice(start, end);

		// Average them
		const sum = window.reduce((a, b) => a + b, 0);
		return sum / window.length;
	});
};

export interface PaceChartProps {
	data: {
		speed: number;
		time: string;
	}[];
	highlightRanges?: {
		start: string | null;
		end: string | null;
	}[];
}

export default function PaceChart({data, highlightRanges = []}: PaceChartProps) {
	const options = {
		responsive: true,
		interaction: {
			mode: "index" as const, // Highlights all points at the same X-axis index
			intersect: false, // Trigger hover without touching the point
		},
		plugins: {
			legend: {
				display: false,
			},
			title: {
				display: false,
			},
			tooltip: {
				enabled: true,
				callbacks: {
					// 1. Edit the top title of the tooltip
					title: (context: TooltipItem<"line">[]) => {
						return context[0].label;
					},
					// 2. Edit the main body text
					label: (context: TooltipItem<"line">) => {
						let label = context.dataset.label || "";
						if (label) {
							label += ": ";
						}
						if (context.parsed.y !== null) {
							label += `${context.parsed.y > 0 ? speedToPace(context.parsed.y) : 0} min/km`;
						}
						return label;
					},
				},
			},
			annotation: {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				annotations: {} as Record<string, any>,
			},
		},
		scales: {
			x: {
				type: "time" as const,
				ticks: {
					maxTicksLimit: 10,
					// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
					callback: function (value: string | number, _index: number, _ticks: any[]) {
						const date = new Date(value);
						const hours = date.getHours().toString().padStart(2, "0");
						const minutes = date.getMinutes().toString().padStart(2, "0");
						//const seconds = date.getSeconds().toString().padStart(2, "0");
						return `${hours}:${minutes}`;
					},
				},
			},
			y: {
				min: 0,
				ticks: {
					// 'value' is the numeric value of the tick
					// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
					callback: function (value: string | number, _index: number, _ticks: any[]) {
						return Number.isFinite(value) && (value as number) > 0
							? speedToPace(value as number)
							: 0; // Custom string
					},
				},
			},
		},
	};

	for (const range of highlightRanges) {
		if (!range.start || !range.end) continue;
		options.plugins!.annotation!.annotations![`highlight-${range.start}`] = {
			type: "box",
			xMin: new Date(range.start),
			xMax: new Date(range.end),
			backgroundColor: "rgba(0, 0, 0, 0.1)",
			borderWidth: 0,
		};
	}

	const labels = data.map((d) => new Date(d.time));

	const chartData = {
		labels,
		datasets: [
			{
				data: smoothData(
					data.map((d) => d.speed),
					15,
				), // Smooth the data with a window size of 5
				borderColor: "rgb(54, 162, 235)",
				backgroundColor: "rgba(54, 162, 235,0.15)",
				pointRadius: 0,
				pointHoverRadius: 5,
				tension: 0.5,
				spanGaps: true,
				fill: true,
				showLine: true,
				borderWidth: 2,
			},
		],
	};

	return <Line options={options} data={chartData} />;
}
