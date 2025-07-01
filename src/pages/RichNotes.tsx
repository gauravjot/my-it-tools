import {useState, useContext, lazy, Suspense, useEffect} from "react";
import "@/assets/styles/rich_notes/main.css";
import {useParams} from "react-router-dom";
import RichNotesSidebar from "@/features/rich_notes/home/sidebar/Sidebar";
import NoteStatus from "@/features/rich_notes/home/NoteStatusIndicator";
import {NoteListItemType} from "@/types/rich_notes/note";
import {UserContext} from "@/App";
import BaseSidebarLayout from "./_layout";
import Spinner from "@/components/ui/spinner/Spinner";
import {ChevronsRight} from "lucide-react";
import {useTheme} from "@/components/theme-provider";
import {useEditorStateStore, State} from "@/zustand/EditorState";
import {useToast} from "@/components/ui/use-toast";

// Lazy imports
const Editor = lazy(() => import("@/features/rich_notes/home/editor/Editor"));
const ShareNotePopup = lazy(() => import("@/features/rich_notes/home/ShareNotePopup"));

export default function RichNotesPage() {
	const {noteid} = useParams(); /* from url: '/note/{noteid}' */
	const theme = useTheme();
	const user = useContext(UserContext);
	const [sharePopupNote, setSharePopupNote] = useState(false);
	const [shareNote, setShareNote] = useState<NoteListItemType | null>(null);
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const {toast} = useToast();

	const EditorState = useEditorStateStore();

	/**
	 * If a user is logged in and a note ID is provided in the URL,
	 * open the note in the editor. If the note is already open, do nothing.
	 */
	useEffect(() => {
		if (
			user &&
			noteid &&
			EditorState.note?.id !== noteid &&
			EditorState.state !== State.LOADING_NOTE
		) {
			EditorState.openNote(noteid).then(() => {
				// smooth scroll to top
				window.scrollTo({top: 0, behavior: "smooth"});
			});
		} else if (!user) {
			// Reset editor state if user is not logged in
			EditorState.reset();
		}
	}, [noteid, user, EditorState]);

	// Handle error state when loading the note
	useEffect(() => {
		if (EditorState.state === State.ERROR_LOADING) {
			toast({
				title: "Error loading note",
				description: `There was an error while loading the note. Please try again. ${EditorState.error}`,
				variant: "destructive",
				duration: 4000,
			});
		}
	}, [EditorState.state, EditorState.error, toast]);

	return (
		<BaseSidebarLayout title={"Rich Notes"}>
			<div className="App min-h-screen">
				<div className="mx-auto lg:flex w-full relative">
					<div
						id="sidebar"
						aria-hidden={isSidebarOpen ? "false" : "true"}
						className="sidebar-hide-able"
					>
						<div className="h-screen print:hidden max-h-screen overflow-y-auto min-w-0 w-full bg-secondary block border-r border-foreground/10 border-solid sticky top-0">
							<RichNotesSidebar
								openShareNote={(note: NoteListItemType) => {
									setShareNote(note);
									setSharePopupNote(true);
								}}
							/>
						</div>
					</div>
					{/*
					 * Toggle to close the sidebar
					 */}
					<>
						<div className="print:hidden fixed top-10 lg:top-16 lg:mt-3 right-auto z-[500] h-0">
							<button
								className="sidebar-expand-btn"
								aria-expanded={isSidebarOpen ? "true" : "false"}
								aria-controls="sidebar"
								onClick={(e) => {
									const isOpen = isSidebarOpen ? false : true;
									setIsSidebarOpen(isOpen);
									e.currentTarget.setAttribute("aria-expanded", isOpen ? "false" : "true");
								}}
								title="Toggle Sidebar"
							>
								<ChevronsRight
									size={18}
									color={theme.theme === "dark" ? "#000" : "#fff"}
									className={"align-text-top transition-all " + (isSidebarOpen ? "rotate-180" : "")}
								/>
							</button>
						</div>
					</>
					<div className="min-h-screen h-full w-full md:px-4 bg-gray-200 relative z-0">
						{/*
						 * Editor area
						 */}
						<div
							className={
								(EditorState.state === State.LOADING_NOTE ? "blur-sm " : "") + "min-h-screen h-full"
							}
						>
							<Suspense
								fallback={
									<div className="flex print:hidden place-items-center flex-row gap-4 justify-center min-h-screen h-full">
										<Spinner color="black" size="md" />
										<p className="inline-block bg-black/5 border border-gray-300 px-2 py-0.5 rounded-md text-bb">
											Loading editor...
										</p>
									</div>
								}
							>
								{/* Editor component */}
								<Editor />
							</Suspense>
							<NoteStatus isLoggedIn={user ? true : false} />
						</div>
						{EditorState.state === State.LOADING_NOTE && (
							<div className="absolute print:hidden z-30 inset-0 flex justify-center place-items-center">
								<Spinner color="black" size="xl" />
							</div>
						)}
					</div>
				</div>
				{/*
				 * Note sharing component
				 */}
				<Suspense fallback={<></>}>
					{shareNote !== null ? (
						<ShareNotePopup
							note={shareNote}
							closePopup={() => setSharePopupNote(false)}
							open={sharePopupNote}
						/>
					) : EditorState.note ? (
						<ShareNotePopup
							note={EditorState.note}
							closePopup={() => setSharePopupNote(false)}
							open={sharePopupNote}
						/>
					) : (
						<></>
					)}
				</Suspense>
			</div>
		</BaseSidebarLayout>
	);
}
