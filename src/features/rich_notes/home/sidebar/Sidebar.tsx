import SideBarNotelistSkeleton from "@/components/skeleton/SidebarNotelistSkeleton";
import {timeSince} from "@/lib/dateTimeUtils";
import {NoteListItemType} from "@/types/rich_notes/note";
import {useEditorStateStore} from "@/zustand/EditorState";
import {Suspense, lazy} from "react";

// Lazy imports
const NoteList = lazy(() => import("@/features/rich_notes/home/sidebar/NoteList"));

interface ISidebarProps {
	openShareNote: (note: NoteListItemType) => void;
}

export default function RichNotesSidebar(props: ISidebarProps) {
	const {note} = useEditorStateStore();

	return (
		<>
			<Suspense fallback={<SideBarNotelistSkeleton />}>
				<>
					<div className="px-3 py-3 flex gap-2 place-items-center border-b border-px border-foreground/20">
						<div className="flex-1 overflow-ellipsis overflow-auto">
							<div className="text-base tracking-tight font-semibold truncate text-foreground whitespace-nowrap">
								{note ? note.title : "Untitled"}
							</div>
							<div className="text-xs text-foreground/50 align-middle block whitespace-nowrap truncate">
								{note ? `(modified ${timeSince(note.updated)})` : "(creating new note)"}
							</div>
						</div>
						<div className="flex flex-col place-items-end gap-2">
							<span className="font-medium text-sm text-muted-foreground">Zoom</span>
							<div className="zoomslidecontainer flex place-items-center">
								<input
									type="range"
									min="2"
									max="5"
									step="0.25"
									defaultValue="3"
									className="zoomslider"
									id="myRange"
									onInput={(e) => {
										let zoomValue: string | number = (e.target as HTMLInputElement).value;
										if (zoomValue !== "") {
											zoomValue = parseFloat(zoomValue);
										}
										zoomValue = ((zoomValue as number) / 3) * 16;
										document
											.getElementById("editor")
											?.style.setProperty("font-size", `${zoomValue}px`);
									}}
								/>
							</div>
						</div>
					</div>
				</>
				<NoteList shareNote={props.openShareNote} />
			</Suspense>
		</>
	);
}
