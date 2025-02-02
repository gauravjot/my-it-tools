import {Moon, Sun} from "lucide-react";
import {useTheme} from "../theme-provider";
import {Button} from "../ui/button";

export default function ThemeToggle() {
	const {theme, setTheme} = useTheme();

	return (
		<Button
			variant="secondary"
			className="rounded-full size-9 p-2"
			size="icon"
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
		>
			<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
