import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {handleAxiosError} from "@/lib/HandleAxiosError";
import {dateTimePretty} from "@/lib/dateTimeUtils";
import {updateNoteTitle} from "@/services/rich_notes/note/update_note_title";
import {NoteListItemType} from "@/types/rich_notes/note";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {AxiosError} from "axios";
import {X} from "lucide-react";
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import * as z from "zod";

export interface IEditNoteNameDialogProps {
	note: NoteListItemType;
	closeFn: () => void;
}

const schema = z.object({
	editnotename: z.string().min(1).max(100),
});

export default function TitleUpdateDialog(props: IEditNoteNameDialogProps) {
	const [error, setError] = useState<string | null>(null);
	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		mode: "all",
	});
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (payload: {editnotename: string}) => {
			return updateNoteTitle(props.note.id, {title: payload.editnotename});
		},
		onSuccess: () => {
			setError(null);
			form.reset();
			queryClient.invalidateQueries({queryKey: ["notes-query"]});
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
		// On load, set the focus on the input field
		window.setTimeout(() => {
			const inputField = document.querySelector("input[name='editnotename']");
			if (inputField) {
				(inputField as HTMLInputElement).focus();
			}
		}, 100);
	}, []);

	return (
		<>
			<div className="max-w-[380px] py-4 px-5 w-4/5 bg-background rounded-2xl shadow-md relative z-10">
				<div className="flex justify-between place-items-center mb-3">
					<h3 className="text-foreground select-none font-semibold text-lg">Edit Note Title</h3>
					<Button variant={"outline"} className="aspect-square p-1 size-8" onClick={closeDialog}>
						<X size={18} />
					</Button>
				</div>
				<div className="mt-4 mb-4 bg-muted py-1 px-2 rounded text-foreground">
					<p className="text-sm font-medium mb-1 select-none">Selected Note</p>
					<p className="text-sm">
						<b>Title:</b> <span className="text-muted-foreground">{props.note.title}</span>
					</p>
					<p className="text-sm">
						<b>Updated on:</b>{" "}
						<span className="text-muted-foreground"> {dateTimePretty(props.note.updated)}</span>
					</p>
				</div>
				{error && <p className="text-sm text-red-600 bg-red-100 px-2 mt-3 py-1 rounded">{error}</p>}
				{mutation.isSuccess && (
					<p className="text-sm text-green-700 bg-green-100 px-2 py-1 mt-3 rounded flex place-items-center gap-2">
						<span className="ic ic-success ic-done"></span>
						<p>Title is updated.</p>
					</p>
				)}
				{!mutation.isSuccess ? (
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit((d) => {
								mutation.mutate({editnotename: d.editnotename});
							})}
						>
							<fieldset disabled={mutation.isPending}>
								<FormField
									control={form.control}
									name="editnotename"
									render={({field}) => (
										<FormItem>
											<FormLabel>New Note Title</FormLabel>
											<FormControl>
												<Input className="w-full" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button
									variant={"accent"}
									disabled={mutation.isPending}
									type="submit"
									className="w-full mt-4"
								>
									Save
								</Button>
							</fieldset>
						</form>
					</Form>
				) : (
					<div className="mt-5">
						<Button className="w-full" variant={"ghost"} onClick={closeDialog}>
							Close
						</Button>
					</div>
				)}
			</div>
		</>
	);
}
