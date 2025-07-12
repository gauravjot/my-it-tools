import Spinner from "@/components/ui/spinner/Spinner";
import {NOTE_STATUS} from "./NoteStatusOptions";
import {State, useEditorStateStore} from "@/zustand/EditorState";

/*
	Status toast types
*/

export interface INoteStatusProps {
	isLoggedIn: boolean;
}

export default function NoteStatus(props: INoteStatusProps) {
	const EditorState = useEditorStateStore();

	const status =
		EditorState.state === State.SAVING_NOTE
			? NOTE_STATUS.saving
			: EditorState.state === State.ERROR_SAVING
			? NOTE_STATUS.failed
			: EditorState.state === State.EDITING_NOTE
			? NOTE_STATUS.saved
			: null;

	return (
		<>
			{props.isLoggedIn ? (
				status && (
					<div
						className={
							"flex place-items-center gap-1.5 fixed select-none print:hidden bottom-0 right-0 shadow rounded-md px-2" +
							" py-1 font-medium text-sm text-white z-30 m-6 " +
							status.color
						}
					>
						{status.message === NOTE_STATUS.saving.message ? (
							<Spinner color="white" size="xs" />
						) : (
							status.Icon
						)}
						<span>{status.message}</span>
					</div>
				)
			) : (
				<div className="fixed bottom-0 right-0 bg-red-900 shadow rounded-md px-2 py-1 font-medium text-sm text-white z-30 m-6">
					<span className="ic ic-white align-middle ic-cloud-fail"></span>
					&nbsp; Sign-in and save in cloud
				</div>
			)}
		</>
	);
}
