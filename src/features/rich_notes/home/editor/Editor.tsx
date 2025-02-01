import {useCallback, useRef, useState} from "react";
import {Editable, Slate, withReact} from "slate-react";
import {createEditor} from "slate";
import {withHistory} from "slate-history";
import "@/assets/styles/rich_notes/editor.css";

import {identifyLinksInTextIfAny, isLinkNodeAtSelection} from "./EditorUtils";
import {EditorToolbar} from "./Toolbar";
import {isEqual} from "lodash";
import {ExampleDocument, SlateDocumentType, SlateNodeType} from "@/lib/rich_notes_utils";
import {NoteType} from "@/types/rich_notes/api";
import useEditorConfig, {LinkEditor} from "@/hooks/rich_notes/useEditorConfig";
import useSelection from "@/hooks/rich_notes/useSelection";

export default function Editor({
	document,
	onChange,
	note,
}: {
	document: SlateDocumentType;
	onChange: (value: SlateNodeType[]) => void;
	note: NoteType | null;
}) {
	const [editor] = useState(() => withReact(withHistory(createEditor())));
	const editorRef = useRef<HTMLDivElement>(null);
	const {renderLeaf, renderElement, KeyBindings} = useEditorConfig(editor);
	const [isEdited, setIsEdited] = useState(!isEqual(document, ExampleDocument) || false);

	const onKeyDown = useCallback(
		(event: any) => KeyBindings.onKeyDown(editor, event),
		[KeyBindings, editor]
	);

	const [previousSelection, selection, setSelection] = useSelection(editor);

	// we update selection here because Slate fires an onChange even on pure selection change.
	const onChangeLocal = useCallback(
		(doc: any) => {
			setIsEdited(true);
			onChange(doc);
			setSelection(editor.selection);
			identifyLinksInTextIfAny(editor);
		},
		[onChange, setSelection, editor]
	);

	let selectionForLink = null;
	if (isLinkNodeAtSelection(editor, selection)) {
		selectionForLink = selection;
	} else if (selection == null && isLinkNodeAtSelection(editor, previousSelection)) {
		selectionForLink = previousSelection;
	}

	return (
		<Slate editor={editor} initialValue={document} onChange={onChangeLocal}>
			<EditorToolbar note={note} />
			{!isEdited ? (
				<div className="z-10 top-1/2 mx-auto left-0 right-0 text-center font-thin text-2xl text-gray-300 user-select-none absolute">
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
							<Editable
								renderElement={renderElement}
								renderLeaf={renderLeaf}
								onKeyDown={onKeyDown}
								spellCheck
							/>
						</div>
					</div>
				</div>
			</div>
		</Slate>
	);
}
