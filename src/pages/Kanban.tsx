import BaseSidebarLayout from "./_layout";
import {useKanbanStateStore} from "@/zustand/KanbanState";

export default function Kanban() {
	const kanbanStore = useKanbanStateStore();

	// Example: Open a board with ID "board1" when the component mounts
	if (kanbanStore.currentBoard === null) {
		kanbanStore.openBoard("board1");
	}

	return (
		<BaseSidebarLayout title="TOTP Tool">
			<div>
				<h1>Kanban Board</h1>
			</div>
		</BaseSidebarLayout>
	);
}
