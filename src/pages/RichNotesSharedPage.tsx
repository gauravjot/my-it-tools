import {useContext, useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {AxiosError} from "axios";
import {Helmet} from "react-helmet";
import * as z from "zod";
// Slate
import {createEditor} from "slate";
import {Slate, Editable, withReact} from "slate-react";
import {useForm} from "react-hook-form";
import "@/assets/styles/rich_notes/editor.css";
import {UserContext} from "@/App";
import useEditorConfig from "@/hooks/rich_notes/useEditorConfig";
import {useQuery} from "@tanstack/react-query";
import {getSharedNote} from "@/services/rich_notes/note/get_shared_note";
import {handleAxiosError} from "@/lib/HandleAxiosError";
import {dateTimePretty, timeSince} from "@/lib/dateTimeUtils";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {zodResolver} from "@hookform/resolvers/zod";
import {ExampleDocument} from "@/lib/rich_notes_utils";

export default function RichNotesSharedPage() {
	const {shareid} = useParams();
	const user = useContext(UserContext);
	const [editor] = useState(() => withReact(createEditor()));
	const {renderLeaf, renderElement} = useEditorConfig(editor);
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [password, setPassword] = useState<string>("");

	useEffect(() => {
		// if mobile toggle sidebar off
		if (window.innerWidth < 1024) {
			setIsSidebarOpen(false);
		}
	}, []);

	const query = useQuery({
		queryKey: ["sharedNote", shareid, password],
		queryFn: async () => {
			if (!shareid) {
				return Promise.reject("No note exist.");
			}
			return await getSharedNote(shareid, password);
		},
		retry: 0, // Disable automatic retries
		refetchOnReconnect: false, // Disable refetching on r| undefinedeconnect
		refetchOnWindowFocus: false, // Disable refetching on window focus
	});

	const providePassword = (password: string) => {
		setPassword(password);
		// Refetch the query with the new password
		query.refetch();
	};

	return (
		<>
			<Helmet>
				<title>{query.isSuccess ? query.data.noteTitle + " | " : ""}Toolkit</title>
			</Helmet>
			<div className="App min-h-screen bg-gray-200">
				<div className="mx-auto lg:flex w-full">
					<div
						id="sidebar"
						aria-hidden={isSidebarOpen ? "false" : "true"}
						className="sidebar-hide-able bg-gray-100 lg:w-72 lg:bg-white p-4 space-y-4 print:hidden"
					>
						<div>
							<Link
								to={"/rich-notes"}
								className="text-sm hover:underline hover:underline-offset-4 whitespace-nowrap overflow-hidden"
							>
								&#8592; Go back to editor
							</Link>
						</div>
						{query.isSuccess && (
							<div>
								<div className="text-xl font-bold text-gray-900 mb-4">
									<span className="font-sans align-middle whitespace-nowrap overflow-hidden">
										Details
									</span>
								</div>
								{query.data.noteSharedBy !== undefined ? (
									<>
										<div className="text-sm font-medium text-gray-500 whitespace-nowrap overflow-hidden">
											Shared by
										</div>
										<div className="whitespace-nowrap overflow-hidden">
											{query.data.noteSharedBy}
										</div>
										<div className="text-xs mb-2 whitespace-nowrap overflow-hidden">
											{query.data.noteSharedByUID}
										</div>
									</>
								) : (
									<></>
								)}
								<div className="text-sm font-medium text-gray-500">Title</div>
								<div>{query.data.noteTitle}</div>
								<div className="text-sm mt-2 font-medium text-gray-500">Modified</div>
								<div className="whitespace-nowrap overflow-hidden">
									{timeSince(query.data.noteUpdated)}
								</div>
								<div className="text-sm mt-2 font-medium text-gray-500">Created</div>
								<div className="whitespace-nowrap overflow-hidden">
									{dateTimePretty(query.data.noteCreated)}
								</div>
								<div className="text-sm mt-2 font-medium text-gray-500">Shared</div>
								<div className="whitespace-nowrap overflow-hidden">
									{dateTimePretty(query.data.noteSharedOn)}
								</div>
							</div>
						)}
						{user && (
							<div>
								<div className="text-xl font-bold text-gray-900 mb-4">
									<span className="font-sans align-middle whitespace-nowrap overflow-hidden">
										Actions
									</span>
								</div>
								<ul>
									<li className="whitespace-nowrap overflow-hidden">&#8594; Make a copy</li>
								</ul>
							</div>
						)}
					</div>

					<div className="min-h-screen w-full lg:flex-1 md:px-4 relative z-0">
						{/*
						 * Toggle to close the sidebar
						 */}

						{/* arrow toggle on desktop */}
						<div className="hidden lg:block sticky top-2 right-auto z-50 -ml-4 left-0 h-0">
							<button
								className="sidebar-expand-btn"
								aria-expanded={isSidebarOpen ? "true" : "false"}
								aria-controls="sidebar"
								onClick={(e) => {
									const isOpen = isSidebarOpen ? false : true;
									setIsSidebarOpen(isOpen);
									e.currentTarget.setAttribute("aria-expanded", isOpen ? "false" : "true");
								}}
								title="Toggle Sidebar"
							>
								<span className="ic ic-white ic-double-arrow align-text-top"></span>
							</button>
						</div>
						{/* hambuger menu for mobile */}
						<div className="fixed top-0 right-0 lg:hidden z-[51]">
							{isSidebarOpen && <div className="z-[40] fixed bg-black/20 inset-0"></div>}
							<button
								className="mobile-sidebar-toggle relative z-[50]"
								aria-expanded={isSidebarOpen ? "true" : "false"}
								aria-controls="sidebar"
								onClick={(e) => {
									const isOpen = isSidebarOpen ? false : true;
									setIsSidebarOpen(isOpen);
									e.currentTarget.setAttribute("aria-expanded", isOpen ? "false" : "true");
								}}
								title="Toggle Mobile Sidebar"
							>
								<div className="hamburger-wrapper">
									<div className="hamburger-line half first"></div>
									<div className="hamburger-line"></div>
									<div className="hamburger-line half last"></div>
								</div>
							</button>
						</div>
						<div className="z-40">
							{query.isSuccess ? (
								<Slate
									editor={editor}
									initialValue={
										query.data.noteContent ? JSON.parse(query.data.noteContent) : ExampleDocument
									}
								>
									<div className="editor-container">
										<div className="editor">
											<div role="textbox">
												<Editable readOnly renderElement={renderElement} renderLeaf={renderLeaf} />
											</div>
										</div>
									</div>
								</Slate>
							) : query.isError ? (
								<>
									<div className="my-4 p-2 border-red-600 border text-red-800 rounded-md">
										<h1 className="font-bold">Something went wrong...</h1>
										<p className="text-md">
											{handleAxiosError(query.error as AxiosError) as string}
										</p>
									</div>
								</>
							) : (
								<></>
							)}
						</div>
					</div>
				</div>
				{/** Password needed */}
				{query.isError &&
				query.error != null &&
				((handleAxiosError(query.error as AxiosError) as string).includes("N1401") ||
					(handleAxiosError(query.error as AxiosError) as string).includes("N1402")) ? (
					<PasswordPrompt
						setPassword={providePassword}
						error={handleAxiosError(query.error as AxiosError) as string}
					/>
				) : (
					<></>
				)}
			</div>
		</>
	);
}

const PasswordPromptFormSchema = z.object({
	password: z.string().max(255),
});

function PasswordPrompt({
	setPassword,
	error,
}: {
	setPassword: (password: string) => void;
	error: string | null;
}) {
	const form = useForm({
		resolver: zodResolver(PasswordPromptFormSchema),
		mode: "all",
		defaultValues: {
			password: "",
		},
	});

	useEffect(() => {
		// On load, set the focus on the password input field
		window.setTimeout(() => {
			const inputField = document.querySelector("input[name='password']");
			if (inputField) {
				(inputField as HTMLInputElement).focus();
			}
		}, 100);
	}, []);

	return (
		<div className="fixed inset-0 flex justify-center place-items-center z-[60]">
			<div className="bg-black/40 absolute inset-0"></div>
			<div className="max-w-[350px] py-4 px-5 w-4/5 bg-white rounded-2xl shadow-md relative z-10">
				<div className="mb-3">
					<h3 className="text-black select-none font-semibold">Password required</h3>
				</div>
				<p className="text-muted-foreground text-sm my-2">
					It seems this note is locked behind the password.
				</p>
				{error && <p className="text-sm text-red-600 bg-red-100 px-2 my-3 py-1 rounded">{error}</p>}
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit((d) => {
							setPassword(d.password);
							form.reset();
						})}
						className="space-y-2"
					>
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
						<Button variant={"accent"} type="submit" className="w-full">
							Submit
						</Button>
					</form>
				</Form>
			</div>
		</div>
	);
}
