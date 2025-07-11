import {AxiosError} from "axios";
import {useContext, useEffect, useRef, useState} from "react";
import {UserContext} from "@/App";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {NoteListItemType} from "@/types/rich_notes/note";
import {deleteNote} from "@/services/rich_notes/note/delete_note";
import {handleAxiosError} from "@/lib/HandleAxiosError";
import {Button} from "@/components/ui/button";
import {X} from "lucide-react";
import {dateTimePretty} from "@/lib/dateTimeUtils";
import {useEditorStateStore} from "@/zustand/EditorState";
import {useNavigate} from "react-router-dom";

export interface IDeleteNoteDialogProps {
	note: NoteListItemType;
	closeFn: () => void;
}

export default function DeleteNoteDialog(props: IDeleteNoteDialogProps) {
	const EditorState = useEditorStateStore();
	const userContext = useContext(UserContext);
	const cancelBtnRef = useRef<HTMLButtonElement>(null);
	const [error, setError] = useState<string | null>(null);
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const mutation = useMutation({
		mutationFn: () => {
			return userContext ? deleteNote(props.note.id) : Promise.reject("User not logged in");
		},
		onSuccess: () => {
			setError(null);
			// navigate to the rich notes home page after deletion
			navigate("/rich-notes", {replace: true});
			// Reset the editor state
			queryClient.invalidateQueries({queryKey: ["notes-query", userContext?.id]});
			EditorState.reset();
			closeDialog();
		},
		onError: (error: AxiosError) => {
			handleAxiosError(error, setError);
		},
	});

	function closeDialog() {
		mutation.reset();
		props.closeFn();
	}

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				mutation.reset();
				props.closeFn();
			}
		}
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [mutation, props]);

	useEffect(() => {
		// On page load, set the focus on the delete button
		window.setTimeout(() => {
			if (cancelBtnRef.current) {
				cancelBtnRef.current.focus();
			}
		}, 100);
	}, [cancelBtnRef]);

	return (
		<>
			<div className="max-w-[380px] py-4 px-5 w-4/5 bg-background rounded-2xl shadow-md relative z-10">
				<div className="flex justify-between place-items-center mb-3">
					<h3 className="text-foreground select-none font-bold">Delete Note</h3>
					<Button variant={"outline"} className="aspect-square p-1 size-8" onClick={closeDialog}>
						<X size={18} />
					</Button>
				</div>
				<div className="mt-4 mb-8">
					<p className="text-sm font-medium text-foreground mb-px select-none">Selected Note</p>
					<p className="text-sm text-foreground/80">{props.note.title}</p>
					<p className="text-sm text-foreground/70 mb-3">
						Updated on {dateTimePretty(props.note.updated)}
					</p>
				</div>
				{error && <p className="text-sm text-red-600 bg-red-100 px-2 my-3 py-1 rounded">{error}</p>}
				{!mutation.isSuccess && (
					<form>
						<fieldset disabled={mutation.isPending}>
							<Button
								variant={"destructive"}
								disabled={mutation.isPending}
								className="w-full"
								onClick={() => mutation.mutate()}
							>
								DELETE NOTE
							</Button>
							<Button
								variant={"outline"}
								ref={cancelBtnRef}
								className="w-full mt-2 focusable-button"
								onClick={closeDialog}
							>
								Cancel
							</Button>
						</fieldset>
					</form>
				)}
			</div>
		</>
	);
}
