import {BACKEND_ENDPOINT} from "@/config";
import {ExampleDocument, SlateDocumentType} from "@/lib/rich_notes_utils";
import {createNote, CreateNoteType} from "@/services/rich_notes/note/create_note";
import {
	updateNoteContent,
	UpdateNoteContentType,
} from "@/services/rich_notes/note/update_note_content";
import {NoteType} from "@/types/rich_notes/api";
import axios from "axios";
import {create} from "zustand";
import {subscribeWithSelector} from "zustand/middleware";

/**
 * Enum to hold editor states.
 */
export enum State {
	NEW_NOTE = "NEW_NOTE", // active when no note is selected or a new note will be created when user types
	EDITING_NOTE = "EDITING_NOTE", // when a selected note is being edited
	SAVING_NOTE = "SAVING_NOTE", // when the note is being saved
	ERROR_SAVING = "ERROR_SAVING", // when there is an error while saving the note
	ERROR_LOADING = "ERROR_LOADING", // when there is an error while loading the note
	LOADING_NOTE = "LOADING_NOTE", // when the note is being loaded
	NOTE_NOT_FOUND = "NOTE_NOT_FOUND", // when the note is not found
}

export interface EditorStateType {
	// State management
	state: State;
	document: SlateDocumentType;
	setDocument: (document: SlateDocumentType) => void;
	note: NoteType | null;
	setNote: (note: NoteType | null) => void;
	error: string | null;
	setError: (error: string | null) => void;

	reset: () => void;

	// Note operations
	saveNote: (content: SlateDocumentType, note: NoteType | null) => Promise<void>;
	openNote: (noteid: NoteType["id"]) => Promise<void>;
}

export const useEditorStateStore = create<EditorStateType>()(
	subscribeWithSelector((set) => ({
		state: State.NEW_NOTE,
		document: ExampleDocument,
		setDocument: (document) => set({document}),
		note: null,
		setNote: (note) => set({note}),
		error: null,
		setError: (error) => set({error}),

		reset: () => {
			set({
				state: State.NEW_NOTE,
				document: ExampleDocument,
				note: null,
				error: null,
			});
		},
		/*



	*/
		saveNote: async (content: SlateDocumentType, note: NoteType | null) => {
			set({state: State.SAVING_NOTE});
			if (note) {
				// Update existing note
				const payload: UpdateNoteContentType = {
					content,
					note_id: note.id,
				};
				try {
					const response = await updateNoteContent(payload);
					if (response) {
						if (note.id === response.id) {
							set({note: response, state: State.EDITING_NOTE, error: null});
						} else {
							set({state: State.EDITING_NOTE, error: null});
						}
					} else {
						set({state: State.ERROR_SAVING, error: "Failed to save note."});
					}
				} catch (error) {
					if (axios.isAxiosError(error)) {
						set({state: State.ERROR_SAVING, error: error.message});
					} else {
						set({
							state: State.ERROR_SAVING,
							error: "Unknown error occurred while saving note.",
						});
					}
				}
			} else {
				// Create a new note
				const payload: CreateNoteType = {
					content,
					title: "Untitled",
				};
				try {
					const response = await createNote(payload);
					if (response) {
						set({state: State.EDITING_NOTE, error: null, note: response});
					}
				} catch (error) {
					if (axios.isAxiosError(error)) {
						set({state: State.ERROR_SAVING, error: error.message});
					} else {
						set({
							state: State.ERROR_SAVING,
							error: "Unknown error occurred while creating note.",
						});
					}
				}
			}
		},
		/*


	*/
		// Open a note by its ID
		openNote: async (noteid: NoteType["id"]) => {
			set({state: State.LOADING_NOTE});
			try {
				const response = await axios.get(BACKEND_ENDPOINT + "/api/rich_notes/" + noteid + "/", {
					headers: {
						"Content-Type": "application/json",
					},
					withCredentials: true,
				});
				if (response.status < 300) {
					const note = response.data as NoteType;

					// try parsing the content as SlateDocumentType
					try {
						const document = JSON.parse(note.content) as SlateDocumentType;
						set({note, document});
						if (note.content === null) {
							throw new Error();
						} else {
							set({state: State.EDITING_NOTE, error: null});
						}
					} catch (error) {
						set({
							state: State.ERROR_LOADING,
							error: `Error parsing note content for "${note.title}".`,
						});
					}
				}
			} catch (error) {
				if (axios.isAxiosError(error)) {
					if (error.response?.status === 404) {
						set({state: State.NOTE_NOT_FOUND, error: "Note not found."});
					} else {
						set({state: State.ERROR_LOADING, error: error.message});
					}
				}
			}
		},
		/*



	*/
	}))
);
