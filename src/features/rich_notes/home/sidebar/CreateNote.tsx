import React, {useContext} from "react";
import {AxiosError} from "axios";
import {useForm} from "react-hook-form";
import {UserContext} from "@/App";
import {useMutation} from "@tanstack/react-query";
import {createNote} from "@/services/rich_notes/note/create_note";
import {ExampleDocument} from "@/lib/rich_notes_utils";
import {handleAxiosError} from "@/lib/HandleAxiosError";
import {NoteType} from "@/types/rich_notes/api";
import {Button} from "@/components/ui/button";

export default function CreateNote({
	onNewNoteCreated,
}: {
	onNewNoteCreated: (note: NoteType) => void;
}) {
	const user = useContext(UserContext);
	const [error, setError] = React.useState<string | null>(null);
	const {
		register,
		handleSubmit,
		reset,
		formState: {errors},
	} = useForm();

	const mutation = useMutation({
		mutationFn: (payload: {title: string}) => {
			return user
				? createNote({title: payload.title, content: ExampleDocument})
				: Promise.reject("User not found");
		},
		onSuccess: (res) => {
			reset();
			onNewNoteCreated(res);
		},
		onError: (error: AxiosError) => {
			handleAxiosError(error, setError);
		},
	});

	return (
		<div className="font-sans px-4 pt-4 pb-4 bg-zinc-800 dark:bg-zinc-950 shadow-black shadow-inner">
			<div className="tracking-wide text-bb font-medium text-white pl-px pt-0.5 pb-3">
				Creating new note
			</div>
			<form
				onSubmit={handleSubmit((d) => {
					mutation.mutate({title: d["create_new_note_title"]});
				})}
			>
				<fieldset disabled={mutation.isPending}>
					<div className="flex place-items-center gap-2">
						<div className="flex-1">
							<input
								type="text"
								id="create_new_note_title"
								placeholder="Type note title here"
								className="rounded-md bg-zinc-700 dark:bg-zinc-800 bg-opacity-70 border border-black border-opacity-80 font-normal tracking-wide w-full px-3 py-[9px] text-sm text-white outline-4 outline outline-transparent focus-visible:outline-primary-500/40 focus-visible:bg-opacity-100 hover:outline-primary-600/20"
								disabled={mutation.isPending}
								{...register("create_new_note_title", {required: "This field is required"})}
							/>
						</div>
						<Button disabled={mutation.isPending} variant={"accent"}>
							Create
						</Button>
					</div>
					{errors && errors["create_new_note_title"] && (
						<p className="text-red-400 text-bb mt-1 leading-5 bg-red-300/10 py-1 px-2 rounded">
							{errors["create_new_note_title"]?.message?.toString()}
						</p>
					)}
					{error && (
						<p className="text-red-400 text-bb mt-1 leading-5 bg-red-300/10 py-1 px-2 rounded">
							{error}
						</p>
					)}
				</fieldset>
			</form>
		</div>
	);
}
