import {toggleBlockType, toggleLinkAtSelection} from "./EditorUtils";

import React, {useContext} from "react";
import {UserContext} from "@/App";
import {NoteType} from "@/types/rich_notes/api";
import TitleUpdateDialog from "../TitleUpdateDialog";
import {
	AlignCenter,
	AlignJustify,
	AlignLeft,
	AlignRight,
	Bold,
	Code,
	CodeSquare,
	Heading1,
	Heading2,
	Heading3,
	Heading4,
	Highlighter,
	ImagePlus,
	Italic,
	Link,
	List,
	ListOrdered,
	MinusSquare,
	Quote,
	Strikethrough,
	Subscript,
	Superscript,
	Text,
	Underline,
} from "lucide-react";
import {BaseEditor, Editor, Element} from "slate";

const PARAGRAPH_STYLES = ["h1", "h2", "h3", "h4", "codeblock", "quote", "ul", "ol"];
const CHARACTER_STYLES = [
	"bold",
	"italic",
	"underline",
	"highlight",
	"code",
	"strike",
	"sup",
	"sub",
];
const TEXT_ALIGN = ["left", "center", "right", "justify"];

function Toolbar({note, editor}: {note: NoteType | null; editor: BaseEditor | null}) {
	const userToken = useContext(UserContext);
	const [isRenameDialogOpen, setIsRenameDialogOpen] = React.useState(false);

	const onBlockTypeChange = (targetType: string) => {
		if (editor === null) {
			return;
		}
		if (targetType === "multiple") {
			return;
		}
		toggleBlockType(editor, targetType);
	};

	const closeEditNameDialog = () => setIsRenameDialogOpen(false);

	return (
		<>
			{isRenameDialogOpen && note && userToken && (
				<div className="fixed inset-0 z-[100] print:hidden">
					<div className="fixed inset-0 bg-black/30 z-0" onClick={closeEditNameDialog}></div>
					<div className="fixed inset-0 flex place-items-center justify-center z-[60]">
						<TitleUpdateDialog note={note} closeFn={closeEditNameDialog} />
					</div>
				</div>
			)}
			<div className="top-16 lg:top-0 z-30 sticky print:hidden" id="toolbar">
				<div className="bg-zinc-50 px-1 mt-1 shadow-md rounded ab-toolbar">
					<div className="py-2 line-height-150 space-y-1">
						{/* Dropdown for paragraph styles */}
						<div className="border-r-2 border-zinc-300 pr-3 inline-block">
							<ElementSelect
								editor={editor}
								elements={PARAGRAPH_STYLES}
								onSelect={onBlockTypeChange}
							/>
						</div>

						{/* Buttons for character styles */}
						<div className="inline-block">
							<div className="inline-block">
								{CHARACTER_STYLES.map((style) => (
									<ToolBarButton
										key={style}
										characterstyle={style}
										label={style}
										isActive={isMarkActive(editor, style)}
										onMouseDown={(event: MouseEvent) => {
											event.preventDefault();
											if (editor) {
												toggleMark(editor, style);
											}
										}}
									/>
								))}
							</div>
							{/* Link Button */}
							<div className="border-r-2 border-zinc-300 inline-block pr-3">
								<ToolBarButton
									isActive={isMarkActive(editor, "link")}
									label={"link"}
									onMouseDown={() => {
										if (editor) {
											toggleLinkAtSelection(editor);
											toggleMark(editor, "link");
										}
									}}
								/>
							</div>
						</div>
						{/* Options for text Alignment */}
						<div className="pr-3 inline-block">
							<ElementSelect editor={editor} elements={TEXT_ALIGN} onSelect={onBlockTypeChange} />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export const EditorToolbar = React.memo(Toolbar, (prevProps, nextProps) => {
	return (
		prevProps.note?.id === nextProps.note?.id &&
		prevProps.note?.title === nextProps.note?.title &&
		prevProps.note?.updated === nextProps.note?.updated
	);
});

// Text Formatting
function ToolBarButton(props: any) {
	const {label, isActive, ...otherProps} = props;
	return (
		<button
			variant=""
			className={
				(isActive ? "bg-zinc-300 hover:outline outline-1 outline-zinc-400 " : "hover:bg-zinc-300") +
				" infotrig ml-3 p-1 text-xs aspect-square"
			}
			active={isActive ? "true" : "false"}
			{...otherProps}
		>
			{getIconForButton(label, isActive)}
			<div className="infomsg mt-3 z-30 whitespace-nowrap">{getTitleForTool(label)}</div>
		</button>
	);
}

function ElementSelect(props: any) {
	const {editor, elements, onSelect} = props;
	return (
		<div className="inline-block">
			{elements.map((element: any, index: number) => (
				<button
					key={index}
					className={
						(isBlockActive(editor, element)
							? "bg-zinc-300 hover:outline outline-1 outline-zinc-400 "
							: "hover:bg-zinc-300") + " infotrig ml-3 p-1 text-xs aspect-square"
					}
					onClick={() => {
						onSelect(element);
					}}
				>
					{getIconAndLabel(element).icon}
					<div className="infomsg mt-3 z-30 whitespace-nowrap">{getTitleForTool(element)}</div>
				</button>
			))}
		</div>
	);
}

function getIconForButton(style: string, isActive: boolean) {
	switch (style) {
		case "bold":
			return <Bold size={18} color={isActive ? "#000" : "#787878"} />;
		case "italic":
			return <Italic size={18} color={isActive ? "#000" : "#787878"} />;
		case "code":
			return <Code size={18} color={isActive ? "#000" : "#787878"} />;
		case "underline":
			return <Underline size={18} color={isActive ? "#000" : "#787878"} />;
		case "highlight":
			return <Highlighter size={18} color={isActive ? "#000" : "#787878"} />;
		case "strike":
			return <Strikethrough size={18} color={isActive ? "#000" : "#787878"} />;
		case "sub":
			return <Subscript size={18} color={isActive ? "#000" : "#787878"} />;
		case "sup":
			return <Superscript size={18} color={isActive ? "#000" : "#787878"} />;
		case "image":
			return <ImagePlus size={18} color={isActive ? "#000" : "#787878"} />;
		case "link":
			return <Link size={18} color={isActive ? "#000" : "#787878"} />;
		default:
			return <MinusSquare size={18} color={isActive ? "#000" : "#787878"} />;
	}
}

function getTitleForTool(tool: string) {
	switch (tool) {
		case "bold":
			return "Bold";
		case "italic":
			return "Italic";
		case "code":
			return "Inline Code";
		case "underline":
			return "Underline";
		case "highlight":
			return "Text Highlight";
		case "strike":
			return "Text Strikethrough";
		case "sub":
			return "Subscript";
		case "sup":
			return "Superscript";
		case "image":
			return "Add Image";
		case "link":
			return "Add Link";
		default:
			return getIconAndLabel(tool).label;
	}
}
// Element Select

function getIconAndLabel(style: string, isActive: boolean = false) {
	switch (style) {
		case "h1":
			return {
				label: "Heading 1",
				icon: <Heading1 size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "h2":
			return {
				label: "Heading 2",
				icon: <Heading2 size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "h3":
			return {
				label: "Heading 3",
				icon: <Heading3 size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "h4":
			return {
				label: "Heading 4",
				icon: <Heading4 size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "paragraph":
			return {label: "Paragraph", icon: <Text size={18} color={isActive ? "#000" : "#787878"} />};
		case "codeblock":
			return {
				label: "Code Block",
				icon: <CodeSquare size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "quote":
			return {label: "Quotations", icon: <Quote size={18} color={isActive ? "#000" : "#787878"} />};
		case "multiple":
			return {
				label: "Multiple",
				icon: <MinusSquare size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "left":
			return {
				label: "Align Left",
				icon: <AlignLeft size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "right":
			return {
				label: "Align Right",
				icon: <AlignRight size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "center":
			return {
				label: "Align Center",
				icon: <AlignCenter size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "justify":
			return {
				label: "Justify Block",
				icon: <AlignJustify size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "ul":
			return {
				label: "Unordered List",
				icon: <List size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "ol":
			return {
				label: "Ordered List",
				icon: <ListOrdered size={18} color={isActive ? "#000" : "#787878"} />,
			};
		default:
			throw new Error(`Unhandled style in getLabelForBlockStyle: ${style}`);
	}
}

const toggleMark = (editor: BaseEditor | null, format: string) => {
	if (editor === null) {
		return;
	}
	const isActive = isMarkActive(editor, format);

	if (isActive) {
		Editor.removeMark(editor, format);
	} else {
		Editor.addMark(editor, format, true);
	}
};
const isMarkActive = (editor: BaseEditor | null, format: any) => {
	if (editor === null) {
		return false;
	}
	const marks = Editor.marks(editor);
	return marks ? Object.keys(marks).includes(format) === true : false;
};

const isBlockActive = (editor: BaseEditor | null, format: string, blockType = "type") => {
	if (editor === null) {
		return false;
	}
	const {selection} = editor;
	if (!selection) return false;

	const [match] = Array.from(
		Editor.nodes(editor, {
			at: Editor.unhangRange(editor, selection),
			match: (n) => !Editor.isEditor(n) && Element.isElement(n) && (n as any)[blockType] === format,
		})
	);

	return !!match;
};
