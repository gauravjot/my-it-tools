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
					<div className="py-2 line-height-150 space-y-1">
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
			{getIconForButton(label, isActive)}
			<div className="infomsg -bottom-6 z-30 whitespace-nowrap">{getTitleForTool(label)}</div>
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

function getIconForButton(style: string, isActive: boolean) {
	switch (style) {
		case "h1":
			return <Heading1 size={18} color={isActive ? "#000" : "#787878"} />;
		case "h2":
			return <Heading2 size={18} color={isActive ? "#000" : "#787878"} />;
		case "h3":
			return <Heading3 size={18} color={isActive ? "#000" : "#787878"} />;
		case "h4":
			return <Heading4 size={18} color={isActive ? "#000" : "#787878"} />;
		case "paragraph":
			return <Text size={18} color={isActive ? "#000" : "#787878"} />;
		case "codeblock":
			return <CodeSquare size={18} color={isActive ? "#000" : "#787878"} />;
		case "quote":
			return <Quote size={18} color={isActive ? "#000" : "#787878"} />;
		case "ul":
			return <List size={18} color={isActive ? "#000" : "#787878"} />;
		case "ol":
			return <ListOrdered size={18} color={isActive ? "#000" : "#787878"} />;

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

		case "left":
			return <AlignLeft size={18} color={isActive ? "#000" : "#787878"} />;
		case "right":
			return <AlignRight size={18} color={isActive ? "#000" : "#787878"} />;
		case "center":
			return <AlignCenter size={18} color={isActive ? "#000" : "#787878"} />;
		case "justify":
			return <AlignJustify size={18} color={isActive ? "#000" : "#787878"} />;
		case "multiple":
			return <MinusSquare size={18} color={isActive ? "#000" : "#787878"} />;

		default:
			return <MinusSquare size={18} color={isActive ? "#000" : "#787878"} />;
	}
}

function getTitleForTool(tool: string) {
	switch (tool) {
		case "h1":
			return "Heading 1";
		case "h2":
			return "Heading 2";
		case "h3":
			return "Heading 3";
		case "h4":
			return "Heading 4";
		case "paragraph":
			return "Paragraph";
		case "codeblock":
			return "Code Block";
		case "quote":
			return "Quotations";
		case "ul":
			return "Unordered List";
		case "ol":
			return "Ordered List";

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

		case "left":
			return "Align Left";
		case "right":
			return "Align Right";
		case "center":
			return "Align Center";
		case "justify":
			return "Justify Block";
		case "multiple":
			return "Multiple Selections";

		default:
			return "Unknown Tool";
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
