import * as React from "react";
import {Input} from "../input";
import {X} from "lucide-react";

export interface ITagInputProps {
	setValue: (value: string[]) => void;
}

export default function TagInput(props: ITagInputProps) {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [tags, setTags] = React.useState<string[]>([]);

	React.useEffect(() => {
		// listener for keydown event: Commas and Enter
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Enter" || event.key === ",") {
				event.preventDefault();
				const value = inputRef.current?.value;
				if (value) {
					setTags((tags) => {
						const newTags = [...tags, value];
						props.setValue(newTags);
						return newTags;
					});
					inputRef.current!.value = "";
				}
			}
		};
		inputRef.current?.addEventListener("keydown", handleKeyDown);

		return () => {
			inputRef.current?.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	return (
		<div className="flex flex-col w-full">
			<Input ref={inputRef} placeholder="Type Enter or Comma to add multiple" />
			<div className="gap-2 space-y-1">
				{tags.map((tag, index) => (
					<div className="inline-flex mt-1 mr-1 place-items-center bg-zinc-200 dark:bg-zinc-800 rounded-full pl-2.5">
						<span className="inline-block mr-1" key={index}>
							{tag}
						</span>
						<button
							className="p-2 hover:bg-muted-foreground/20 rounded-r-full"
							onClick={() => {
								setTags((tags) => {
									const newTags = tags.filter((_, i) => i !== index);
									props.setValue(newTags);
									return newTags;
								});
							}}
						>
							<X size={16} />
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
