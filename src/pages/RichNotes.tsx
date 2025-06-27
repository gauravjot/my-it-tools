import {useState, useCallback, useEffect, useContext, lazy, Suspense} from "react";
import axios from "axios";
import "@/assets/styles/rich_notes/main.css";
import _ from "lodash";
import {useParams, useNavigate} from "react-router-dom";
import {NoteType} from "@/types/rich_notes/api";
import RichNotesSidebar from "@/features/rich_notes/home/sidebar/Sidebar";
import NoteStatus, {SavingState} from "@/features/rich_notes/home/NoteStatusIndicator";
import {NoteListItemType} from "@/types/rich_notes/note";
import {
	UpdateNoteContentType,
	updateNoteContent,
} from "@/services/rich_notes/note/update_note_content";
import {createNote} from "@/services/rich_notes/note/create_note";
import {NOTE_STATUS} from "@/features/rich_notes/home/NoteStatusOptions";
import {UserContext} from "@/App";
import {ExampleDocument, SlateDocumentType} from "@/lib/rich_notes_utils";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {BACKEND_ENDPOINT} from "@/config";
import BaseSidebarLayout from "./_layout";
import Spinner from "@/components/ui/spinner/Spinner";
import {ChevronsRight} from "lucide-react";
import {useTheme} from "@/components/theme-provider";
import {useToast} from "@/components/ui/use-toast";

// Lazy imports
const Editor = lazy(() => import("@/features/rich_notes/home/editor/Editor"));
const ShareNotePopup = lazy(() => import("@/features/rich_notes/home/ShareNotePopup"));

export default function RichNotesPage() {
	const {noteid} = useParams(); /* from url: '/note/{noteid}' */
	const theme = useTheme();
	const navigate = useNavigate();
	const user = useContext(UserContext);
	const [status, setStatus] = useState<SavingState | null>(null);
	const [note, setNote] = useState<NoteType | null>(null);
	const [document, setDocument] = useState<SlateDocumentType>(ExampleDocument);
	const [isNoteLoading, setIsNoteLoading] = useState(false);
	const [sharePopupNote, setSharePopupNote] = useState(false);
	const [shareNote, setShareNote] = useState<NoteListItemType | null>(null);
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const queryClient = useQueryClient();
	const {toast} = useToast();

	const updateNoteMutation = useMutation({
		mutationFn: (payload: UpdateNoteContentType) => {
			return user ? updateNoteContent(payload) : Promise.reject("Note not found");
		},
		onSuccess: (res) => {
			const response = res as NoteType;
			if (note?.id === response.id) {
				setNote(response);
			}
			setTimeout(() => {
				setStatus(null);
			}, 500);
			window.onbeforeunload = null;
		},
		onError: () => {
			setStatus(NOTE_STATUS.failed);
		},
	});

	const createNoteMutation = useMutation({
		mutationFn: (payload: {title: string; content: SlateDocumentType}) => {
			return user ? createNote(payload) : Promise.reject("User not found");
		},
		onSuccess: (res) => {
			setStatus(null);
			if (note?.id === res.id) {
				setNote(res);
			}
			navigate("/note/" + res.id);
			window.onbeforeunload = null;
			queryClient.invalidateQueries({queryKey: ["notes-query"]});
		},
		onError: () => {
			setStatus(NOTE_STATUS.failed);
		},
	});

	const saveNote = (content: SlateDocumentType, note: NoteType | null) => {
		setStatus(NOTE_STATUS.saving);
		const title = note ? note.title : "Untitled";
		if (user) {
			if (note) {
				// Update note
				updateNoteMutation.mutate({content: content, note_id: note.id});
			} else {
				// Create note
				createNoteMutation.mutate({title, content});
			}
		} else {
			setStatus(NOTE_STATUS.failed);
		}
	};

	const openNote = useCallback(
		(n_id: NoteType["id"] | null) => {
			if (user && n_id) {
				setIsNoteLoading(true);
				const config = {
					headers: {
						"Content-Type": "application/json",
					},
					withCredentials: true,
				};
				axios
					.get(BACKEND_ENDPOINT + "/api/rich_notes/" + n_id + "/", config)
					.then(function (response) {
						// Close the sidebar on mobile if open
						if (window.innerWidth < 1024) {
							setIsSidebarOpen(false);
						}
						// smooth scroll to top
						window.scrollTo({top: 0, behavior: "smooth"});
						// set note
						setNote(response.data);
						try {
							if (response.data.content === null) {
								throw new Error("Note is either empty or corrupted. It cannot be recovered.");
							}
							setDocument(JSON.parse(response.data.content));
						} catch (e) {
							// Let user know that the note is corrupted
							toast({
								description: `Some error has occured: ${
									e instanceof Error ? e.message : "Unknown"
								}`,
								variant: "destructive",
								duration: 2000,
							});
							setDocument(ExampleDocument);
						}
						setIsNoteLoading(false);
						navigate("/rich-notes/" + n_id);
					})
					.catch(function (error) {
						setIsNoteLoading(false);
						if (error.response.data.code === "N0404") {
							// Note not found
							navigate("/");
						}
					});
			} else {
				navigate("/");
			}
		},
		[navigate, user]
	);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const editorDebounced = useCallback(
		_.debounce(
			(note: NoteType, value: SlateDocumentType) => {
				if (user) {
					// If user is logged in then save the note
					saveNote(value, note);
				} else {
					setStatus(null);
				}
			},
			500,
			{leading: false, trailing: true, maxWait: 60000}
		),
		[user]
	);

	const handleEditorChange = useCallback(
		(document: SlateDocumentType, note: NoteType | null, value: SlateDocumentType) => {
			/**
			 * We need to pass `document` and `note` instead of reading from document level
			 * variable to prevent wrongful saves in case user switches to another note while
			 * the previous note is still saving.
			 */
			if (!_.isEqual(value, note ? JSON.parse(note?.content) : document)) {
				if (note) {
					window.onbeforeunload = function () {
						alert("Note is not yet saved. Please wait!");
						return true;
					};
					editorDebounced(note, value);
				}
			}
		},
		[editorDebounced]
	);

	useEffect(() => {
		if (!user) {
			setNote(null);
			setDocument(ExampleDocument);
		} else {
			// Check if url has note id and no note is open
			if (noteid && !note) {
				openNote(noteid);
			}
		}
	}, [user, note, noteid, openNote]);

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
								currentNoteID={note ? note.id : null}
								currentNote={note}
								openNote={openNote}
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
						<div className={(isNoteLoading ? "blur-sm " : "") + "min-h-screen h-full"}>
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
								<Editor
									document={document}
									onChange={(value) => handleEditorChange(document, note, value)}
									key={note ? note.id : ""}
									note={note}
								/>
							</Suspense>
							<NoteStatus status={status} isLoggedIn={user ? true : false} />
						</div>
						{isNoteLoading && (
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
					) : note ? (
						<ShareNotePopup
							note={note}
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
