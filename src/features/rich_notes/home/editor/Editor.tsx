import _, {isEqual} from "lodash";
import {
	useCallback,
	useRef,
	useState,
	KeyboardEventHandler,
	useContext,
	useEffect,
	useMemo,
} from "react";
import {Editable, Slate, withReact} from "slate-react";
import {createEditor, Descendant} from "slate";
import {withHistory} from "slate-history";
import "@/assets/styles/rich_notes/editor.css";

import {identifyLinksInTextIfAny, isLinkNodeAtSelection} from "./EditorUtils";
import {EditorToolbar} from "./Toolbar";
import {ExampleDocument, SlateDocumentType} from "@/lib/rich_notes_utils";
import useEditorConfig, {LinkEditor} from "@/hooks/rich_notes/useEditorConfig";
import useSelection from "@/hooks/rich_notes/useSelection";
import {State, useEditorStateStore} from "@/zustand/EditorState";
import {NoteType} from "@/types/rich_notes/api";
import {UserContext} from "@/App";
import {useToast} from "@/components/ui/use-toast";

export default function Editor() {
	const EditorState = useEditorStateStore();
	const user = useContext(UserContext);

	const editorRef = useRef<HTMLDivElement>(null);
	const [editor] = useState(() => withReact(withHistory(createEditor())));
	const {renderLeaf, renderElement, KeyBindings} = useEditorConfig(editor);
	const [isEdited, setIsEdited] = useState(false);
	const [editorKey, setEditorKey] = useState("new-editor");

	const document = useMemo(() => EditorState.document ?? ExampleDocument, [EditorState.document]);

	const {toast} = useToast();

	console.log("Editor rerender");

	/**
	 * Debounced function to save the note.
	 * It waits for 500ms after the last change before saving.
	 */
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const editorDebounced = useCallback(
		_.debounce(
			async (note: NoteType | null, value: SlateDocumentType) => {
				await EditorState.saveNote(value, note);
				window.onbeforeunload = null;
			},
			500,
			{leading: false, trailing: true, maxWait: 60000}
		),
		[user]
	);

	// Handle error state when loading the note
	useEffect(() => {
		if (EditorState.state === State.ERROR_SAVING) {
			toast({
				title: "Error saving note",
				description: `There was an error while saving the note. Please try again. ${EditorState.error}`,
				variant: "destructive",
				duration: 2000,
			});
		}
	}, [EditorState.state, EditorState.error, toast]);

	// Subscribe to note updates that happen outside of this component
	useEffect(() => {
		const unsub = useEditorStateStore.subscribe((currentState, prevState) => {
			// If the previos state was SAVING_NOTE then that means user had the note open and it was being saved.
			// Otherwise, the state should be LOADING_NOTE, i.e. user was opening a note, then we should not change the editor key.
			if (prevState.state !== State.SAVING_NOTE && currentState.state === State.EDITING_NOTE) {
				setEditorKey(currentState.note?.id ?? "new-editor");
			} else if (currentState.state === State.NEW_NOTE) {
				setEditorKey("new-editor");
			}
		});

		return () => {
			unsub();
		};
	}, []);

	const onKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback(
		(event) => KeyBindings.onKeyDown(editor, event),
		[KeyBindings, editor]
	);

	const [previousSelection, selection, setSelection] = useSelection(editor);

	/**
	 * Triggers when the editor content changes.
	 * Updates the editor state, current selection, and identifies links in the text.
	 */
	const onChangeLocal = useCallback(
		(doc: Descendant[]) => {
			setSelection(editor.selection);
			identifyLinksInTextIfAny(editor);

			// Save it IF the document is not equal to the current note content
			// or if the note is not yet saved (i.e., EditorState.note is null)
			if (
				!_.isEqual(doc, EditorState.note ? JSON.parse(EditorState.note?.content) : ExampleDocument)
			) {
				if (!isEdited) {
					setIsEdited(true);
				}
				window.onbeforeunload = function () {
					alert("Note is not yet saved. Please wait!");
					return true;
				};
				// Scenarios when we do not want to save the note:
				// 1. If the note is already being saved, we don't want to trigger another save.
				// 2. If document is empty and note is null, then we dont want to save it.
				if (EditorState.state !== State.SAVING_NOTE && !_.isEqual(doc, ExampleDocument)) {
					editorDebounced(EditorState.note, doc as SlateDocumentType);
				}
			}
		},
		[EditorState, setSelection, editor, editorDebounced, isEdited]
	);

	let selectionForLink = null;
	if (isLinkNodeAtSelection(editor, selection)) {
		selectionForLink = selection;
	} else if (selection == null && isLinkNodeAtSelection(editor, previousSelection)) {
		selectionForLink = previousSelection;
	}

	return (
		<>
			<EditorToolbar editor={editor} selection={JSON.stringify(selection)} />
			<Slate editor={editor} initialValue={document} onChange={onChangeLocal} key={editorKey}>
				{!isEdited &&
				isEqual(EditorState.document, ExampleDocument) &&
				EditorState.state !== State.ERROR_LOADING ? (
					<div className="z-10 top-1/2 mx-auto left-0 right-0 text-center font-thin text-2xl text-gray-400 user-select-none absolute">
						start typing and we'll auto save
					</div>
				) : (
					""
				)}
				<div className="editor-container">
					<div>
						<div>
							<div className="editor" ref={editorRef} id="editor">
								{selectionForLink != null ? (
									<LinkEditor
										editorOffsets={
											editorRef.current != null
												? {
														x: editorRef.current.getBoundingClientRect().x,
														y: editorRef.current.getBoundingClientRect().y,
														// eslint-disable-next-line no-mixed-spaces-and-tabs
												  }
												: null
										}
										selectionForLink={selectionForLink}
									/>
								) : null}
								{EditorState.state !== State.LOADING_NOTE &&
								EditorState.state !== State.ERROR_LOADING ? (
									<Editable
										renderElement={renderElement}
										renderLeaf={renderLeaf}
										onKeyDown={onKeyDown}
										spellCheck
									/>
								) : (
									<></>
								)}
							</div>
						</div>
					</div>
				</div>
			</Slate>
		</>
	);
}
