import React, {useContext} from "react";
import CreateNote from "./CreateNote";
import NoteItem from "./NoteItem";
import {UserContext} from "@/App";
import SideBarNotelistSkeleton from "@/components/skeleton/SidebarNotelistSkeleton";
import {NoteType} from "@/types/rich_notes/api";
import {NoteListItemType} from "@/types/rich_notes/note";
import {getNoteList} from "@/services/rich_notes/note/get_note_list";
import {useQuery} from "@tanstack/react-query";
import {monthYear} from "@/lib/dateTimeUtils";
import {X} from "lucide-react";
import {useTheme} from "@/components/theme-provider";

interface Props {
	currentNote: NoteType["id"] | null;
	openNote: (nid: NoteType["id"] | null) => void;
	shareNote: (note: NoteListItemType) => void;
}

export default function NoteList({openNote, shareNote, currentNote}: Props) {
	const userContext = useContext(UserContext);
	const isDark = useTheme().theme === "dark";
	const [showCreateBox, setShowCreateBox] = React.useState(false);
	const notes = useQuery({
		queryKey: ["notes-query", userContext?.id],
		queryFn: () => (userContext ? getNoteList() : Promise.reject("User not logged in")),
		enabled: !!userContext,
	});

	const newNoteCreated = (note: NoteType) => {
		setShowCreateBox(false);
		notes.refetch();
		openNote(note.id);
	};

	let count: string;

	return userContext ? (
		<div className="">
			<div className="relative mt-4 user-select-none flex flex-wrap">
				<div className="flex-1 ml-4 mb-2.5">
					<span className="font-sans text-foreground text-lg lg:ml-4 align-middle whitespace-nowrap overflow-hidden font-semibold">
						Notes
					</span>
				</div>
				<div className="flex-none h-max mr-4">
					<div
						onClick={() => {
							if (!showCreateBox) {
								setTimeout(() => {
									document?.getElementById("create_new_note_title")?.focus();
								}, 150);
							}
							setShowCreateBox(!showCreateBox);
						}}
						aria-selected={showCreateBox}
						className="infotrig sidebar-make-note-popup cursor-pointer"
					>
						<X
							size={18}
							color={isDark ? "#fff" : showCreateBox ? "#fff" : "#000"}
							className={(showCreateBox ? "" : "rotate-45") + " ic inline-block transition-all"}
						/>
						<div className="infomsg bottom-1.5 right-10 whitespace-nowrap">
							{showCreateBox ? "Close" : "Make new note"}
						</div>
					</div>
				</div>
				<div
					className={
						(showCreateBox ? "max-h-44" : "max-h-0") +
						" basis-full transition-all duration-200 ease-linear overflow-hidden"
					}
				>
					<CreateNote onNewNoteCreated={newNoteCreated} />
				</div>
			</div>
			{notes.isSuccess && notes.data.length > 0 ? (
				<div className="block relative notelist h-full overflow-y-auto overflow-x-hidden min-h-[24rem]">
					{notes.data.map((note) => {
						return (
							<div key={note.id}>
								{monthYear(note.updated) !== count ? (
									<div className="sticky top-0 z-10 rounded mx-2 mt-2 mb-1 text-xs text-foreground/70 font-medium bg-zinc-200 dark:bg-zinc-900 px-4 py-1.5 pb-1 tracking-wide user-select-none whitespace-nowrap overflow-hidden">
										{(count = monthYear(note.updated))}
									</div>
								) : (
									""
								)}
								<NoteItem
									note={note}
									openNote={openNote}
									shareNote={shareNote}
									isActive={note.id === currentNote}
								/>
							</div>
						);
					})}
				</div>
			) : notes.isSuccess && notes.data.length === 0 ? (
				<div className="px-6 py-4 text-xl text-gray-400 font-thin user-select-none">
					It's so empty here. Make a note in editor!
				</div>
			) : notes.isLoading ? (
				<SideBarNotelistSkeleton />
			) : notes.isError ? (
				<div className="px-6 py-4 text-xl text-gray-400 font-thin user-select-none">
					Unable to fetch notes. Please reload page try again.
				</div>
			) : (
				<></>
			)}
		</div>
	) : (
		<></>
	);
}
