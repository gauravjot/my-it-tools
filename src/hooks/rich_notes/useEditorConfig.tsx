import {DefaultElement, ReactEditor} from "slate-react";
import isHotkey from "is-hotkey";
import {BaseEditor, Node} from "slate";
import {Editor, Transforms} from "slate";
import {useCallback, useState, useEffect, useRef} from "react";
import {useSlateStatic} from "slate-react";
import {Button} from "@/components/ui/button";
import {ExternalLink, Save} from "lucide-react";
import {
	insertContent,
	toggleBlockType,
	toggleStyle,
} from "@/features/rich_notes/home/editor/EditorUtils";

export default function useEditorConfig(editor: BaseEditor & ReactEditor) {
	const {isVoid} = editor;
	editor.isVoid = (element: any) => {
		return ["image"].includes(element.type) || isVoid(element);
	};

	editor.isInline = (element: any) => ["link"].includes(element.type);

	return {renderElement, renderLeaf, KeyBindings};
}

function renderElement(props: any) {
	const {element, children, attributes} = props;
	const style = {textAlign: element.align};
	switch (element.type) {
		case "image":
			return <Image {...props} />;
		case "paragraph":
			return (
				<p className="editor-p" style={style} {...attributes}>
					{children}
				</p>
			);
		case "h1":
			return (
				<h1 className="editor-h1" style={style} {...attributes}>
					{children}
				</h1>
			);
		case "h2":
			return (
				<h2 className="editor-h2" style={style} {...attributes}>
					{children}
				</h2>
			);
		case "h3":
			return (
				<h3 className="editor-h3" style={style} {...attributes}>
					{children}
				</h3>
			);
		case "h4":
			return (
				<h4 className="editor-h4" style={style} {...attributes}>
					{children}
				</h4>
			);
		case "codeblock":
			return (
				<div className="editor-codeblock" style={style} {...attributes} spellCheck="false">
					{children}
				</div>
			);
		case "quote":
			return (
				<div className="editor-quote" style={style} {...attributes}>
					{children}
				</div>
			);

		case "ul":
			return (
				<ul className="editor-ul" style={style} {...attributes}>
					{children}
				</ul>
			);

		case "ol":
			return (
				<ol className="editor-ol" style={style} {...attributes}>
					{children}
				</ol>
			);

		case "li":
			return (
				<li className="editor-li" style={style} {...attributes}>
					{children}
				</li>
			);

		case "link":
			return <Link {...props} url={element.url} />;
		case "link-editor":
			return <LinkEditor {...props} />;
		default:
			return <DefaultElement {...props} />;
	}
}

function renderLeaf(props: any) {
	return <StyledText {...props} />;
}

const KeyBindings = {
	onKeyDown: (editor: any, event: any) => {
		if (isHotkey("mod+b", event)) {
			event.preventDefault();
			toggleStyle(editor, "bold");
			return;
		}
		if (isHotkey("mod+i", event)) {
			event.preventDefault();
			toggleStyle(editor, "italic");
			return;
		}
		if (isHotkey("mod+h", event)) {
			event.preventDefault();
			toggleStyle(editor, "highlight");
			return;
		}
		if (isHotkey("mod+u", event)) {
			event.preventDefault();
			toggleStyle(editor, "underline");
			return;
		}
		if (isHotkey("mod+`", event)) {
			event.preventDefault();
			toggleStyle(editor, "code");
			return;
		}
		if (isHotkey("tab", event)) {
			event.preventDefault();
			insertContent(editor, "	");
			return;
		}
		if (isHotkey("mod+shift+`", event)) {
			event.preventDefault();
			toggleBlockType(editor, "codeblock");
			return;
		}
		if (isHotkey("mod+shift+1", event)) {
			event.preventDefault();
			toggleBlockType(editor, "h1");
			return;
		}
		if (isHotkey("mod+shift+2", event)) {
			event.preventDefault();
			toggleBlockType(editor, "h2");
			return;
		}
		if (isHotkey("mod+shift+3", event)) {
			event.preventDefault();
			toggleBlockType(editor, "h3");
			return;
		}
		if (isHotkey("mod+shift+4", event)) {
			event.preventDefault();
			toggleBlockType(editor, "h4");
			return;
		}
	},
};

function StyledText({attributes, children, leaf}: any) {
	if (leaf.bold) {
		children = <strong {...attributes}>{children}</strong>;
	}

	if (leaf.code) {
		children = <code {...attributes}>{children}</code>;
	}

	if (leaf.italic) {
		children = <em {...attributes}>{children}</em>;
	}

	if (leaf.underline) {
		children = <u {...attributes}>{children}</u>;
	}

	if (leaf.strike) {
		children = <s {...attributes}>{children}</s>;
	}

	if (leaf.sub) {
		children = <sub {...attributes}>{children}</sub>;
	}

	if (leaf.sup) {
		children = <sup {...attributes}>{children}</sup>;
	}

	if (leaf.highlight) {
		children = (
			<span className="editor-highlight" {...attributes}>
				{children}
			</span>
		);
	}

	return <span {...attributes}>{children}</span>;
}

export const Image = ({attributes, children, element}: any) => {
	const [isEditingCaption, setEditingCaption] = useState(false);
	const [caption, setCaption] = useState(element.caption);
	const editor = useSlateStatic();

	const applyCaptionChange = useCallback(
		(captionInput: any) => {
			const imageNodeEntry = Editor.above(editor, {
				match: (n: any) => n.type === "image",
			});
			if (imageNodeEntry == null) {
				return;
			}

			if (captionInput != null) {
				setCaption(captionInput);
			}

			Transforms.setNodes(editor, {}, {at: imageNodeEntry[1]});
		},
		[editor, setCaption]
	);

	const onCaptionChange = useCallback(
		(event: any) => {
			setCaption(event.target.value);
		},
		[setCaption]
	);

	const onKeyDown = useCallback(
		(event: any) => {
			if (!isHotkey("enter", event)) {
				return;
			}
			event.preventDefault();

			applyCaptionChange(event.target.value);
			setEditingCaption(false);
		},
		[applyCaptionChange, setEditingCaption]
	);

	const onToggleCaptionEditMode = useCallback(() => {
		const wasEditing = isEditingCaption;
		setEditingCaption(!isEditingCaption);
		wasEditing && applyCaptionChange(caption);
	}, [isEditingCaption, applyCaptionChange, caption]);

	return (
		<div contentEditable={false} {...attributes}>
			<div>
				{!element.isUploading && element.url != null ? (
					<img src={String(element.url)} alt={caption} className={"image"} />
				) : (
					<div className={"image-upload-placeholder"}>
						<div />
					</div>
				)}
				{isEditingCaption ? (
					<div
						autoFocus={true}
						className={"image-caption-input"}
						defaultValue={caption}
						onKeyDown={onKeyDown}
						onChange={onCaptionChange}
						onBlur={onToggleCaptionEditMode}
					/>
				) : (
					<div className={"image-caption-read-mode"} onClick={onToggleCaptionEditMode}>
						{element.caption}
					</div>
				)}
			</div>
			{children}
		</div>
	);
};

export function Link({element, attributes, children}: any) {
	return (
		<a href={element.url} {...attributes} className={"link"}>
			{children}
		</a>
	);
}

export function LinkEditor({editorOffsets, selectionForLink}: any) {
	const linkEditorRef = useRef<HTMLDivElement>(null);
	const [saveBtnIcon, setSaveBtnIcon] = useState<"done" | "save">("save");
	const editor = useSlateStatic();
	const [node, path] = Editor.above(editor, {
		at: selectionForLink,
		match: (n: any) => n.type === "link",
	}) || [null, null];

	const [linkURL, setLinkURL] = useState((node as {url?: string})?.url);

	useEffect(() => {
		setLinkURL((node as {url?: string})?.url);
	}, [node]);

	const onLinkURLChange = useCallback(
		(event: any) => {
			setSaveBtnIcon("save");
			setLinkURL(event.target.value);
		},
		[setLinkURL]
	);

	const onApply = useCallback(() => {
		setSaveBtnIcon("done");
		let url = String(linkURL);
		if (!(url.includes("//") || url.includes("\\\\"))) {
			url = "http://" + url;
		}
		setLinkURL(url);

		// ...

		if (path !== null) {
			Transforms.setNodes(
				editor,
				{
					url: url as string,
				} as Partial<Node>,
				{at: path}
			);
		}
	}, [editor, linkURL, path]);

	useEffect(() => {
		const editorEl = linkEditorRef.current;
		if (editorEl == null || node == null || editorOffsets == null) {
			return;
		}

		// ...

		const linkDOMNode = ReactEditor.toDOMNode(editor as ReactEditor, node); // Cast editor as ReactEditor
		const {x: nodeX, height: nodeHeight, y: nodeY} = linkDOMNode.getBoundingClientRect();

		editorEl.style.display = "block";
		editorEl.style.top = `${nodeY + nodeHeight - editorOffsets.y}px`;
		editorEl.style.left = `${nodeX - editorOffsets.x}px`;
	}, [editor, editorOffsets.x, editorOffsets.y, node]);

	if (editorOffsets == null) {
		return null;
	}

	return (
		<div
			ref={linkEditorRef}
			className="absolute max-sm:left-4 z-20 bg-white shadow border border-solid border-gray-100 rounded-xl px-2 mt-2"
		>
			<div className="text-sm flex place-items-center">
				<Button
					onClick={() => window.open(linkURL, "_blank")}
					variant={"ghost"}
					disabled={String(linkURL).length < 3}
				>
					<ExternalLink size={18} />
				</Button>
				<input
					className="ml-2 my-2 mr-2 px-2 py-1 rounded bg-opacity-50 focus:outline-none active:outline-none focus-visible:outline-none bg-gray-200 focus-visible:bg-opacity-80 text-sm border"
					type="text"
					value={linkURL}
					placeholder="insert a link here"
					onChange={onLinkURLChange}
				/>
				<Button disabled={String(linkURL).length < 3} onClick={onApply} variant={"ghost"}>
					<Save size={18} />
				</Button>
			</div>
		</div>
	);
}
