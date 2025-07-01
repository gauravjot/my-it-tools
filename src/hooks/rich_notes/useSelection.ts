import {useCallback, useRef, useState} from "react";

import areEqual from "deep-equal";
import {BaseEditor, BaseRange, BaseSelection} from "slate";
import {ReactEditor} from "slate-react";

export default function useSelection(
	editor: BaseEditor & ReactEditor
): [BaseRange | null, BaseSelection, (newSelection: BaseSelection) => void] {
	const [selection, setSelection] = useState<BaseSelection>(editor.selection);
	const previousSelection = useRef<BaseRange | null>(null);
	const setSelectionOptimized = useCallback(
		(newSelection: BaseSelection) => {
			if (areEqual(selection, newSelection)) {
				return;
			}
			previousSelection.current = selection;
			setSelection(newSelection);
		},
		[setSelection, selection]
	);

	return [previousSelection.current, selection, setSelectionOptimized];
}
