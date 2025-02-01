import {Button} from "@/components/ui/button";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
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

	return (
		<>
			<div className="max-w-[380px] py-4 px-5 w-4/5 bg-white rounded-2xl shadow-md relative z-10">
				<div className="flex justify-between place-items-center mb-3">
					<h3 className="text-black select-none">Edit Note Title</h3>
					<Button variant={"ghost"} onClick={closeDialog}>
						<X size={18} />
					</Button>
				</div>
				<div className="mt-6 mb-4">
					<p className="text-sm font-medium text-gray-800 mb-px select-none">Selected Note</p>
					<p className="text-sm text-gray-500">{props.note.title}</p>
					<p className="text-sm text-gray-500">Updated on {dateTimePretty(props.note.updated)}</p>
				</div>
				{error && <p className="text-sm text-red-600 bg-red-100 px-2 mt-3 py-1 rounded">{error}</p>}
				{mutation.isSuccess && (
					<p className="text-sm text-green-700 bg-green-100 px-2 py-1 mt-3 rounded flex place-items-center gap-2">
						<span className="ic ic-success ic-done"></span>
						<p>Title is updated.</p>
					</p>
				)}
				{!mutation.isSuccess ? (
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
							<Button disabled={mutation.isPending} type="submit" className="w-full">
								Save
							</Button>
						</fieldset>
					</form>
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
