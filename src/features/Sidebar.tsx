import {Button} from "@/components/ui/button";
import ThemeToggler from "@/components/utils/ThemeToggler";
import {Key, Menu, RectangleEllipsis, X} from "lucide-react";
import {useState} from "react";
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
];

export default function Sidebar() {
	const currentPage = window.location;
	const [isOpen, setIsOpen] = useState<boolean>(false);

	return (
		<>
			{!isOpen && (
				<div className="fixed z-50 top-2 right-2 lg:hidden">
					<Button
						className="aspect-sqaure size-12 !p-1 rounded-full"
						onClick={() => {
							setIsOpen(true);
						}}
					>
						<Menu size={24} />
					</Button>
				</div>
			)}
			<div
				className={
					"bg-white dark:bg-zinc-900 py-2 shadow min-h-screen" + (!isOpen && " hidden lg:block")
				}
			>
				<div className="flex gap-4 py-2 mx-4 place-items-center">
					<Link
						to={"/"}
						className="flex-1 text-lg font-bold tracking-tight text-black dark:text-white"
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
				<div className="flex flex-col gap-1 mx-2 my-8">
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
			</div>
		</>
	);
}
