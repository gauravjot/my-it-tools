import {UserContext} from "@/App";
import {Button} from "@/components/ui/button";
import ThemeToggler from "@/components/utils/ThemeToggler";
import {BACKEND_ENDPOINT, FRONTEND_ENDPOINT} from "@/config";
import {
	BriefcaseBusiness,
	DollarSign,
	Key,
	LogIn,
	LogOut,
	Menu,
	Notebook,
	RectangleEllipsis,
	X,
} from "lucide-react";
import {useContext, useState} from "react";
import {Link} from "react-router-dom";

const links = [
	{
		name: "Password Generator",
		to: "/password-generator",
		icon: <Key size={14} strokeWidth={3} />,
	},
	{
		name: "TOTP Tool",
		to: "/totp-tool",
		icon: <RectangleEllipsis size={14} strokeWidth={3} />,
	},
	{
		name: "Job Application Tracker",
		to: "/job-application-tracker",
		icon: <BriefcaseBusiness size={14} strokeWidth={3} />,
	},
	{
		name: "Expense Tracker",
		to: "/expense-tracker",
		icon: <DollarSign size={14} strokeWidth={3} />,
	},
	{
		name: "Rich Notes",
		to: "/rich-notes",
		icon: <Notebook size={14} strokeWidth={3} />,
	},
];

export default function Sidebar({title}: {title?: string}) {
	const currentPage = window.location;
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const user = useContext(UserContext);

	return (
		<>
			{!isOpen && (
				<div className="max-w-full lg:hidden print:hidden">
					<div className="p-2 dark:bg-zinc-900 bg-white shadow-md flex place-items-center">
						<h1 className="flex-1 text-foreground ml-2 font-semibold text-lg truncate pr-4">
							{title ?? "Toolkit"}
						</h1>
						<div>
							<Button
								className="aspect-sqaure size-12 !p-1 rounded-full"
								onClick={() => {
									setIsOpen(true);
								}}
							>
								<Menu size={24} />
							</Button>
						</div>
					</div>
				</div>
			)}
			<div
				className={
					"bg-white dark:bg-zinc-900 flex-col py-2 shadow min-h-screen print:hidden" +
					(!isOpen && " hidden lg:flex")
				}
			>
				<div className="flex gap-4 mx-2 place-items-center">
					<Link
						to={"/"}
						className="flex-1 text-lg ml-2 font-bold tracking-tight text-black dark:text-white"
					>
						My IT Tools
					</Link>
					<ThemeToggler />
					{isOpen && (
						<Button
							className="aspect-sqaure size-12 !p-1 rounded-full lg:hidden"
							variant={"destructive"}
							onClick={() => {
								setIsOpen(false);
							}}
						>
							<X size={24} />
						</Button>
					)}
				</div>
				<div className="flex flex-col flex-1 gap-1 mx-2 my-8">
					{links.map((link) => (
						<Link
							key={link.to}
							to={link.to}
							className={
								"flex text-sm font-medium gap-2 place-items-center text-zinc-800 dark:text-zinc-100 px-3 py-2 hover:outline hover:outline-1 hover:outline-zinc-600 dark:hover:outline-zinc-400 rounded-md hover:no-underline" +
								(currentPage.pathname === link.to ? " bg-zinc-100 dark:bg-zinc-700" : "")
							}
						>
							{link.icon}
							{link.name}
						</Link>
					))}
				</div>
				<div className="flex flex-col">
					{user ? (
						<div className="flex flex-row justify-between gap-2 mx-3 mt-4 place-items-center">
							<div className="text-sm font-medium text-zinc-800 dark:text-zinc-100 py-2 rounded-md leading-4">
								Welcome {user.first_name}
								<br />
								<span className="text-muted-foreground font-normal text-xs">{user.email}</span>
							</div>
							<div>
								<a
									title="Logout"
									aria-label="Logout"
									href={`${BACKEND_ENDPOINT}/auth/sign-out/?redirect=${FRONTEND_ENDPOINT}&referrer=${window.location.href}`}
									className="flex text-sm aspect-square font-medium place-items-center text-zinc-800 dark:text-zinc-100 px-3 py-2 hover:outline hover:outline-1 hover:outline-zinc-600 dark:hover:outline-zinc-400 rounded-md hover:no-underline"
								>
									<LogOut size={14} strokeWidth={3} />
								</a>
							</div>
						</div>
					) : (
						<div className="flex flex-col gap-2 mx-2 mt-4">
							<a
								href={`${BACKEND_ENDPOINT}/auth/?redirect=${window.location.href}`}
								className="flex text-sm font-medium gap-2 place-items-center text-zinc-800 dark:text-zinc-100 px-3 py-2 hover:outline hover:outline-1 hover:outline-zinc-600 dark:hover:outline-zinc-400 rounded-md hover:no-underline"
							>
								<LogIn size={14} strokeWidth={3} />
								Sign In
							</a>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
