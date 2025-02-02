import {useCallback, useContext, useEffect, useState} from "react";
import {AxiosError} from "axios";
import {UserContext} from "@/App";
import {useForm} from "react-hook-form";
import Spinner from "@/components/ui/spinner/Spinner";
import {NoteListItemType} from "@/types/rich_notes/note";
import {useMutation, useQuery} from "@tanstack/react-query";
import {getNoteShares} from "@/services/rich_notes/note/get_note_shares";
import {ShareNoteQueryType, shareNoteQuery} from "@/services/rich_notes/note/create_share_link";
import {handleAxiosError} from "@/lib/HandleAxiosError";
import {Button} from "@/components/ui/button";
import {Lock, X} from "lucide-react";
import {timeSince} from "@/lib/dateTimeUtils";
import * as z from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {ShareNote} from "@/types/rich_notes/api";
import {
	DisableShareLinkType,
	disableShareLinkQuery,
} from "@/services/rich_notes/note/disable_share_link";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@radix-ui/react-checkbox";

interface Props {
	note: NoteListItemType;
	closePopup: () => void;
	open: boolean;
}

const ShareLinkCreateFormSchema = z.object({
	title: z.string().min(1).max(255),
	anon: z.boolean(),
	pass_protect: z.boolean(),
	password: z.string().max(255),
});

export default function ShareNotePopup({closePopup, note, open}: Props) {
	const userContext = useContext(UserContext);
	const form = useForm<z.infer<typeof ShareLinkCreateFormSchema>>({
		resolver: zodResolver(ShareLinkCreateFormSchema),
		defaultValues: {
			anon: false,
			pass_protect: false,
		},
		mode: "all",
	});
	const [shareNoteQueryError, setShareNoteQueryError] = useState<string | null>(null);

	const shareListQuery = useQuery({
		queryKey: ["shareList", note.id],
		queryFn: () => getNoteShares(note.id),
		refetchOnWindowFocus: false,
	});

	const shareNoteMutation = useMutation({
		mutationFn: (payload: ShareNoteQueryType) => {
			return userContext && userContext
				? shareNoteQuery(note.id, payload)
				: Promise.reject("User authentication error. Logout and login again to retry.");
		},
		onSuccess: () => {
			setShareNoteQueryError(null);
			shareListQuery.refetch();
		},
		onError: (error: AxiosError) => {
			handleAxiosError(error, setShareNoteQueryError);
		},
	});

	const closeFn = useCallback(() => {
		closePopup();
		setTimeout(() => {
			shareNoteMutation.reset();
			setShareNoteQueryError(null);
			form.reset();
		}, 1000);
	}, [closePopup, shareNoteMutation, form]);

	const createNewShareLink = (d: z.infer<typeof ShareLinkCreateFormSchema>) => {
		shareNoteMutation.mutate({
			title: d.title,
			anonymous: d.anon,
			active: true,
			password: d.pass_protect ? (d.password ? d.password : null) : null,
		});
	};

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				closeFn();
			}
		}
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [closeFn]);

	return (
		<div aria-expanded={open} className="share-sidebar">
			{open && <div className="bg-black/30 inset-0 fixed z-0" onClick={closeFn}></div>}
			<div className="share-sidebar-content">
				<div className="px-4 lg:px-6 h-screen flex flex-col">
					<div>
						<div className="absolute top-4 right-4 z-20">
							<Button variant={"ghost"} className="aspect-square p-0" onClick={closeFn}>
								<X size={22} />
							</Button>
						</div>
						<h2 className="pt-9 lg:pt-7 mb-4 font-semibold text-lg">Share note</h2>
						<p className="mt-6 text-foreground font-medium text-md tracking-wide">{note.title}</p>
						<p className="mt-1 text-muted-foreground text-bb tracking-wide">
							Last updated {timeSince(note.updated)}
						</p>
						<div>
							<div>
								{shareNoteMutation.isSuccess ? (
									<>
										<div className="mt-6 text-gray-900 font-medium text-md tracking-wide">
											Your link is ready
										</div>
										<div className="mt-3 py-1 px-2 text-sm text-yellow-800 bg-yellow-100">
											This is the only time you will see this link. Save it somewhere safe. You can
											make more in future.
										</div>
										<div className="flex gap-2 mt-4">
											<input
												type="text"
												className="w-full border border-gray-400 rounded-md py-1.5 px-2 bg-gray-100 text-bb focus-visible:outline-none"
												value={
													window.location.origin +
													"/rich-notes/shared/" +
													shareNoteMutation.data.urlkey
												}
												readOnly
											/>
											<button
												id="copy-button"
												className="text-primary-600 text-sm font-bold uppercase border border-primary-500 px-2 py-0.5 rounded-md shadow-sm hover:bg-primary-50 hover:outline hover:outline-primary-200"
												onClick={(self) => {
													navigator.clipboard.writeText(
														window.location.origin +
															"/rich-notes/shared/" +
															shareNoteMutation.data.urlkey
													);
													self.currentTarget.innerHTML = "Copied!";
												}}
											>
												Copy
											</button>
										</div>
										<div className="text-sm mt-3 text-gray-600 flex gap-2">
											<span className="text-gray-700 font-medium">Anonymous:</span>
											<span>{shareNoteMutation.data.anonymous ? "Yes" : "No"}</span>
										</div>
										<div className="text-sm mt-1.5 text-gray-600 flex gap-2">
											<span className="text-gray-700 font-medium">Password Protected:</span>
											<span>{shareNoteMutation.data.isPasswordProtected ? "Yes" : "No"}</span>
										</div>
									</>
								) : (
									<>
										<h2 className="pt-7 pb-2 font-semibold">Share With</h2>
										{shareNoteQueryError && (
											<p className="mx-4 mt-4 text-red-700 text-sm">{shareNoteQueryError}</p>
										)}
										<Form {...form}>
											<form
												className="mt-2 space-y-2"
												onSubmit={form.handleSubmit(createNewShareLink)}
											>
												<FormField
													control={form.control}
													name="title"
													render={({field}) => (
														<FormItem>
															<FormLabel>Title</FormLabel>
															<FormControl>
																<Input placeholder="friends, work, ..." {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="pass_protect"
													render={({field}) => (
														<FormItem>
															<FormLabel>Protect Link with Password</FormLabel>
															<FormControl>
																<Checkbox
																	className="size-10"
																	checked={field.value}
																	onCheckedChange={field.onChange}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="password"
													render={({field}) => (
														<FormItem>
															<FormLabel>Password</FormLabel>
															<FormControl>
																<Input {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="anon"
													render={({field}) => (
														<FormItem>
															<FormLabel>Share as anonymous</FormLabel>
															<FormControl>
																<Checkbox checked={field.value} onCheckedChange={field.onChange} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<Button
													type="submit"
													variant={"accent"}
													disabled={shareNoteMutation.isPending}
												>
													Get Share Link
												</Button>
											</form>
										</Form>
									</>
								)}
							</div>
						</div>
					</div>
					<div className="flex-1 flex flex-col h-full overflow-auto">
						{shareListQuery.isSuccess ? (
							<>
								<h2 className="pt-7 pb-2 font-semibold">Past Shares</h2>
								<div className="flex-1 overflow-y-auto	h-full">
									{shareListQuery.data.length > 0 ? (
										shareListQuery.data.map((link) => {
											return <ShareLinkItem link={link} key={link.id} />;
										})
									) : (
										<p className="mt-4 text-muted-foreground text-sm">
											The links you create to share will appear here!
										</p>
									)}
								</div>
							</>
						) : shareListQuery.isLoading ? (
							<div className="flex justify-center py-12">
								<Spinner color="primary" size="sm" />
							</div>
						) : shareListQuery.isError ? (
							<p className="mx-4 mt-4 text-red-700 dark:text-red-400 text-sm">
								Some error prevented fetching past shares
							</p>
						) : (
							<></>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function ShareLinkItem({link}: {link: ShareNote}) {
	const userContext = useContext(UserContext);

	const disableShareLinkMutation = useMutation({
		mutationFn: (payload: DisableShareLinkType) => {
			return userContext && userContext
				? disableShareLinkQuery(payload)
				: Promise.reject("User authentication error. Logout and login again to retry.");
		},
	});

	return (
		<div
			className="last:mb-4 flex items-center py-0.5 pl-2 gap-3 border-b border-mutedbg-foreground/50 whitespace-nowrap overflow-hidden"
			key={link.id}
		>
			<div className="grid md:grid-cols-4 md:gap-3 py-4 lg:py-0 flex-1 truncate">
				<div className="col-span-1 text-xs text-muted-foreground">{timeSince(link.created)}</div>
				<div className="col-span-2 text-sm flex gap-1 place-items-center truncate">
					{link.isPasswordProtected ? <Lock size={16} color="#090" /> : <></>}
					{link.title ? (
						link.title
					) : (
						<span className="text-muted-foreground text-xs truncate">no title</span>
					)}
				</div>
				<div className="col-span-1 text-xs text-muted-foreground">
					{link.anonymous ? "Anonymous" : ""}
				</div>
			</div>
			<div className="col-span-1 text-right pr-2">
				<Button
					disabled={disableShareLinkMutation.isSuccess || !link.active}
					onClick={() => disableShareLinkMutation.mutate({id: link.id})}
					variant={"ghost"}
					size={"sm"}
				>
					{disableShareLinkMutation.isSuccess || !link.active ? "Disabled" : "Disable"}
				</Button>
			</div>
		</div>
	);
}
