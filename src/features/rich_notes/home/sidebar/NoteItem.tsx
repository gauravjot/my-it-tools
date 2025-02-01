import React, {useContext} from "react";
import TitleUpdateDialog from "../TitleUpdateDialog";
import {UserContext} from "@/App";
import DeleteNoteDialog from "./DeleteNoteDialog";
import {NoteListItemType} from "@/types/rich_notes/note";
import {NoteType} from "@/types/rich_notes/api";
import {dateTimePretty, timeSince} from "@/lib/dateTimeUtils";
import {Edit, EllipsisVertical, Share2, Trash2} from "lucide-react";
import {useTheme} from "@/components/theme-provider";

interface Props {
	note: NoteListItemType;
	openNote: (nid: NoteType["id"] | null) => void;
	shareNote: (note: NoteListItemType) => void;
	isActive: boolean;
}

export default function NoteItem({note, isActive, openNote, shareNote}: Props) {
	const isDark = useTheme().theme === "dark";
	const optionsRef = React.useRef<HTMLDivElement>(null);
	const [menuOpen, setMenuOpen] = React.useState(false);
	const [showRenameDialogOpen, setShowRenameDialogOpen] = React.useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
	const userContext = useContext(UserContext);

	const closeMenu = (e: MouseEvent) => {
		if (
			!document.getElementById(note.id + "-option-box")?.contains(e.target as Node) &&
			!document.getElementById(note.id + "-option-btn")?.contains(e.target as Node)
		) {
			setMenuOpen(false);
		}
	};

	const closeEditNameDialog = () => setShowRenameDialogOpen(false);

	const renameNote = () => setShowRenameDialogOpen(true);

	return (
		<>
			<div className="sidebar-notelist-item" aria-current={isActive}>
				{showRenameDialogOpen && userContext && (
					<div className="fixed inset-0 z-50">
						<div className="fixed inset-0 bg-black/30 z-0" onClick={closeEditNameDialog}></div>
						<div className="fixed inset-0 flex place-items-center justify-center z-[60]">
							<TitleUpdateDialog note={note} closeFn={closeEditNameDialog} />
						</div>
					</div>
				)}
				<div
					className="flex-grow pr-2 py-2 cursor-pointer overflow-hidden"
					onClick={() => {
						openNote(note.id);
					}}
				>
					<div className="text-foreground/90 font-medium line-height-125 truncate overflow-hidden whitespace-nowrap overflow-ellipsis">
						{note.title}
					</div>

					<div className="text-xs mt-1 whitespace-nowrap overflow-hidden">
						<span className="active-badge">Active</span>
						<span className="text-foreground/60" title={`Modified ${timeSince(note.updated)}`}>
							{dateTimePretty(note.updated)}
						</span>
					</div>
				</div>
				<div className="h-fit self-center relative">
					<button
						className="line-height-0 p-1 ml-2 cursor-pointer group hover:rotate-90 focus:rotate-90 focus:scale-150 focus-within:rotate-90 transition-all rounded-md"
						id={note.id + "-option-btn"}
						aria-expanded={menuOpen}
						onClick={() => {
							setMenuOpen((val) => {
								if (val) {
									// menu will go away
									window.removeEventListener("click", closeMenu);
								} else {
									// menu will appear
									window.addEventListener("click", closeMenu);
								}
								return !val;
							});
						}}
					>
						<EllipsisVertical
							size={18}
							color={isDark ? "#eaeaea" : "#232323"}
							className="group-hover:invert-0 group-focus:invert-0 align-middle"
						/>
					</button>
					<div
						ref={optionsRef}
						aria-hidden={!menuOpen}
						id={note.id + "-option-box"}
						className={
							"transition-transform origin-bottom-right absolute right-8 -bottom-2" +
							" bg-background border border-foreground/20 shadow-md border-solid" +
							" rounded-lg shadow-lg z-20 sidebar-note-menu p-2 flex flex-col gap-1"
						}
					>
						<button
							className={
								"min-w-28 text-sm font-medium pr-3 pl-2 py-2 md:py-1.5 lg:py-1 w-full text-left rounded" +
								" hover:outline hover:outline-2 hover:outline-primary-500 focus-within:bg-primary-100" +
								" text-foreground/90 flex place-items-center gap-2.5"
							}
							onClick={() => {
								setMenuOpen(false);
								setTimeout(() => {
									document?.getElementById("editnotename")?.focus();
								}, 100);
								renameNote();
							}}
						>
							<Edit size={14} />
							<span>Rename</span>
						</button>
						<button
							className={
								"text-sm font-medium pr-3 pl-2 py-2 md:py-1.5 lg:py-1 w-full text-left rounded" +
								" hover:outline hover:outline-2 hover:outline-primary-500 focus-within:bg-primary-100" +
								" text-foreground/90 flex place-items-center gap-2.5"
							}
							onClick={() => {
								shareNote(note);
								setMenuOpen(false);
								document.removeEventListener("mousedown", closeMenu);
							}}
						>
							<Share2 size={14} />
							<span>Share</span>
						</button>
						<button
							className={
								"text-sm font-medium pr-3 pl-2 py-2 md:py-1.5 lg:py-1 w-full text-left rounded" +
								" hover:outline hover:outline-2 hover:outline-primary-500 focus-within:bg-primary-100" +
								" text-foreground/90 flex place-items-center gap-2.5"
							}
							onClick={() => setShowDeleteDialog(true)}
						>
							<Trash2 size={14} />
							<span>Delete</span>
						</button>
					</div>
				</div>
			</div>

			{/** Delete Note Dialog */}
			{showDeleteDialog && (
				<div className="fixed inset-0 size-full flex place-items-center justify-center z-50">
					<div className="bg-black/30 absolute inset-0"></div>
					<DeleteNoteDialog
						closeFn={() => setShowDeleteDialog(false)}
						note={note}
						openNote={openNote}
					/>
				</div>
			)}
		</>
	);
}
