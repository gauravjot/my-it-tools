import {Button} from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {deleteRun} from "@/services/run_analyzer/delete_run";
import {RunType} from "@/types/run_analyzer/run";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {
	Calendar,
	EllipsisVertical,
	History,
	Hourglass,
	RulerDimensionLine,
	Trash2,
} from "lucide-react";

export default function RunList({
	runs,
	currentRun,
	openRun,
}: {
	runs: RunType[];
	currentRun: RunType | null;
	openRun: (run: RunType) => void;
}) {
	const queryClient = useQueryClient();

	const deleteMutation = useMutation({
		mutationFn: (run_id: string) => deleteRun(run_id),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ["runs"]});
		},
	});

	return runs.length > 0 ? (
		<div className="my-4">
			{runs.map((r: RunType) => (
				<div
					key={r.id}
					className={`${currentRun && currentRun.id === r.id ? "bg-blue-500/10 hover:bg-blue-400/20" : "hover:bg-gray-100 dark:hover:bg-zinc-800"} border rounded p-3 cursor-pointer my-1 flex items-center gap-4`}
				>
					<div className="flex-1" onClick={() => openRun(r)}>
						<div className="font-medium flex items-center justify-between">
							<span>{r.title}</span>
							{r.is_interval && <History size={16} className="inline ml-3 text-blue-600" />}
						</div>
						<div className="flex gap-2 place-items-center mt-1">
							<RulerDimensionLine size={16} className="inline" />
							<span className="text-sm text-muted-foreground">{r.distance.toFixed(2)} km</span>
							<Hourglass size={16} className="inline ml-3" />
							<span className="text-sm text-muted-foreground">
								{new Date(r.time_end).getTime() - new Date(r.time_start).getTime() > 0
									? new Date(new Date(r.time_end).getTime() - new Date(r.time_start).getTime())
											.toISOString()
											.substr(11, 8)
									: "N/A"}
							</span>
							<Calendar size={16} className="inline ml-3" />
							<span className="text-sm text-muted-foreground">
								{new Date(r.time_start).toLocaleDateString("en-US", {
									year: "numeric",
									month: "short",
									day: "numeric",
								})}
							</span>
						</div>
					</div>
					<div className="">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant={"ghost"} className="size-10 p-0">
									<EllipsisVertical size={16} />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuGroup>
									<DropdownMenuItem
										className="gap-1 items-center"
										onClick={() => {
											deleteMutation.mutate(r.id);
										}}
									>
										<Trash2 size={14} />
										<span>Delete</span>
									</DropdownMenuItem>
								</DropdownMenuGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			))}
		</div>
	) : (
		<p className="text-sm text-muted-foreground">No runs recorded yet.</p>
	);
}
