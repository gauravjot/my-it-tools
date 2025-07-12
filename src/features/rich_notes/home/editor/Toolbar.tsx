import {Button} from "@/components/ui/button";
import {toggleBlockType, toggleLinkAtSelection} from "./EditorUtils";

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
import {BaseEditor, BaseSelection, Editor, Element} from "slate";

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

export function EditorToolbar({
	editor,
	selection,
}: {
	editor: BaseEditor | null;
	selection: string | null;
}) {
	const selectionTyped = selection ? JSON.parse(selection) : null;

	/**
	 * Toggles the block type of the selected text.
	 * Used for: headings, code blocks, quotes, lists, paragraph justifications.
	 */
	const onBlockTypeChange = (targetType: string) => {
		if (editor === null) {
			return;
		}
		if (targetType === "multiple") {
			return;
		}
		toggleBlockType(editor, targetType);
	};

	return (
		<>
			<div className="top-16 lg:top-0 z-30 sticky print:hidden" id="toolbar">
				<div className="bg-zinc-50 px-1 mt-1 shadow-md rounded ab-toolbar">
					<div className="py-2 line-height-150">
						{/* Dropdown for paragraph styles */}
						<div className="border-r-2 border-zinc-300 pr-3 inline-block">
							<ElementSelect
								editor={editor}
								elements={PARAGRAPH_STYLES}
								selection={selectionTyped}
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
							<ElementSelect
								editor={editor}
								selection={selectionTyped}
								elements={TEXT_ALIGN}
								onSelect={onBlockTypeChange}
							/>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

// Text Formatting
function ToolBarButton(props: {
	label: string;
	isActive: boolean;
	characterstyle?: string;
	[key: string]: unknown;
}) {
	const {label, isActive, ...otherProps} = props;
	const tool = getTool(label, isActive);

	return (
		<Button
			variant="ghost"
			size={"icon"}
			className={
				(isActive ? "bg-zinc-300 hover:outline outline-1 outline-zinc-400 " : "hover:bg-zinc-300") +
				" infotrig ml-1 p-0 size-8 text-xs aspect-square"
			}
			{...otherProps}
		>
			{tool.Icon}
			<div className="infomsg -bottom-10 z-30 whitespace-nowrap">
				{tool.name}
				{tool.shortcut ? (
					<span className="block text-xs text-zinc-200 ml-1 tracking-tighter">{tool.shortcut}</span>
				) : null}
			</div>
		</Button>
	);
}

/**
 * Only one of the elements can be selected at a time.
 * This component renders a list of buttons for each element type.
 */
function ElementSelect({
	editor,
	elements,
	onSelect,
	selection,
}: {
	editor: BaseEditor | null;
	elements: string[];
	onSelect: (targetType: string) => void;
	selection: BaseSelection;
}) {
	return (
		<div className="inline-block">
			{elements.map((element: string, index: number) => (
				<ToolBarButton
					key={index}
					isActive={isBlockActive(editor, selection, element)}
					label={element}
					onMouseDown={() => {
						onSelect(element);
					}}
				/>
			))}
		</div>
	);
}

function getTool(
	tool: string,
	isActive: boolean
): {name: string; shortcut?: string; Icon: JSX.Element} {
	switch (tool) {
		case "h1":
			return {
				name: "Heading 1",
				shortcut: "Ctrl+Shift+1",
				Icon: <Heading1 size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "h2":
			return {
				name: "Heading 2",
				shortcut: "Ctrl+Shift+2",
				Icon: <Heading2 size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "h3":
			return {
				name: "Heading 3",
				shortcut: "Ctrl+Shift+3",
				Icon: <Heading3 size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "h4":
			return {
				name: "Heading 4",
				shortcut: "Ctrl+Shift+4",
				Icon: <Heading4 size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "paragraph":
			return {
				name: "Paragraph",
				shortcut: "Ctrl+Shift+P",
				Icon: <Text size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "codeblock":
			return {
				name: "Code Block",
				shortcut: "Ctrl+Shift+`",
				Icon: <CodeSquare size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "quote":
			return {
				name: "Quoteblock",
				Icon: <Quote size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "ul":
			return {
				name: "Unordered List",
				Icon: <List size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "ol":
			return {
				name: "Ordered List",
				Icon: <ListOrdered size={18} color={isActive ? "#000" : "#787878"} />,
			};

		case "bold":
			return {
				name: "Bold",
				shortcut: "Ctrl+B",
				Icon: <Bold size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "italic":
			return {
				name: "Italic",
				shortcut: "Ctrl+I",
				Icon: <Italic size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "code":
			return {
				name: "Inline Code",
				shortcut: "Ctrl+`",
				Icon: <Code size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "underline":
			return {
				name: "Underline",
				shortcut: "Ctrl+U",
				Icon: <Underline size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "highlight":
			return {
				name: "Highlight",
				shortcut: "Ctrl+H",
				Icon: <Highlighter size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "strike":
			return {
				name: "Strikethrough",
				Icon: <Strikethrough size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "sub":
			return {
				name: "Subscript",
				Icon: <Subscript size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "sup":
			return {
				name: "Superscript",
				Icon: <Superscript size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "image":
			return {
				name: "Insert Image",
				Icon: <ImagePlus size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "link":
			return {
				name: "Insert Link",
				shortcut: "Ctrl+K",
				Icon: <Link size={18} color={isActive ? "#000" : "#787878"} />,
			};

		case "left":
			return {
				name: "Align Left",
				Icon: <AlignLeft size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "right":
			return {
				name: "Align Right",
				Icon: <AlignRight size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "center":
			return {
				name: "Align Center",
				Icon: <AlignCenter size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "justify":
			return {
				name: "Justify",
				Icon: <AlignJustify size={18} color={isActive ? "#000" : "#787878"} />,
			};
		case "multiple":
			return {
				name: "Multiple Styles",
				Icon: <MinusSquare size={18} color={isActive ? "#000" : "#787878"} />,
			};

		default:
			return {
				name: "Unknown Tool",
				Icon: <MinusSquare size={18} color={isActive ? "#000" : "#787878"} />,
			};
	}
}

/**
 * This is for toggling text formatting marks like bold, italic, underline, etc.
 */
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
const isMarkActive = (editor: BaseEditor | null, format: string) => {
	if (editor === null) {
		return false;
	}
	const marks = Editor.marks(editor);
	return marks ? Object.keys(marks).includes(format) === true : false;
};

const isBlockActive = (
	editor: BaseEditor | null,
	selection: BaseSelection | null,
	element: string
) => {
	if (editor === null) {
		return false;
	}
	if (!selection) return false;

	const [match] = Array.from(
		Editor.nodes(editor, {
			at: Editor.unhangRange(editor, selection),
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			match: (n) => !Editor.isEditor(n) && Element.isElement(n) && (n as any)["type"] === element,
		})
	);

	return !!match;
};
