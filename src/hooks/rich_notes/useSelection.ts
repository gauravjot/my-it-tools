import { useCallback, useRef, useState } from "react";

import areEqual from "deep-equal";
import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";

export default function useSelection(editor: BaseEditor & ReactEditor) {
	const [selection, setSelection] = useState(editor.selection);
	const previousSelection = useRef<any>(null);
	const setSelectionOptimized = useCallback(
		(newSelection: any) => {
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
