import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {ClipboardList, RefreshCcw} from "lucide-react";
import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import BaseSidebarLayout from "./_layout";
import useLocalStorage from "@/hooks/useLocalStorage";
import {dateTimePretty} from "@/lib/dateTimeUtils";
import {useToast} from "@/components/ui/use-toast";

interface PasswordStoreType {
	datetime: string;
	value: string;
}

export default function PasswordGenerator() {
	const copyBtnRef = useRef<HTMLSpanElement>(null);
	const [password, setPassword] = useState("");
	const [length, setLength] = useLocalStorage<number>("password-generator-length", 10); // Default length of password
	const [prevPasswords, setPrevPasswords] = useLocalStorage<PasswordStoreType[]>(
		"password-generator-history",
		[],
	);
	const navigate = useNavigate();
	const {toast} = useToast();

	// Function to generate a random password with at least one lowercase, one uppercase, and one symbol
	const generatePassword = (len: number) => {
		const lowercase = "abcdefghijkmnpqrstuvwxyz";
		const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
		const number = "123456789";
		const symbols = "!@#$%&*_+";

		let newPassword = "";

		// Ensure at least one of each type in the password
		const getRandomChar = (charset: string) => {
			const randomIndex = Math.floor(Math.random() * charset.length);
			return charset[randomIndex];
		};

		newPassword += getRandomChar(lowercase); // At least one lowercase
		newPassword += getRandomChar(uppercase); // At least one uppercase
		newPassword += getRandomChar(number); // At least one number
		newPassword += getRandomChar(symbols); // At least one symbol

		// Fill the rest of the password with random characters
		const remainingLength = len - 4; // Minus 3 for the lowercase, uppercase, number, and symbol
		const charset = lowercase + uppercase + symbols + number;
		for (let i = 0; i < remainingLength; i++) {
			const randomIndex = Math.floor(Math.random() * charset.length);
			newPassword += charset[randomIndex];
		}

		// Shuffle the password characters to randomize the positions
		newPassword = newPassword
			.split("")
			.sort(() => Math.random() - 0.5)
			.join("");

		return newPassword;
	};

	// Update password whenever length changes
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		let paramLength;
		if (length === null) {
			paramLength = parseInt(urlParams.get("length") || "10", 10);
			if (!isNaN(paramLength)) {
				setLength(paramLength);
			}
		} else {
			paramLength = length;
		}
		const newPassword = generatePassword(paramLength);
		setPassword(newPassword);
		// Update URL with query parameter
		urlParams.set("length", paramLength + "");
		navigate({search: urlParams.toString()});
	}, [length, navigate]);

	// Function to handle input change for password length
	const handleLengthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newLength = parseInt(event.target.value, 10);
		if (!isNaN(newLength)) {
			setLength(newLength);
		}
	};

	return (
		<BaseSidebarLayout title="Password Generator">
			<div className="flex max-w-lg mx-auto mt-12 place-items-center">
				<div className="w-full p-8 m-4 lg:m-8 bg-white shadow-md dark:bg-zinc-900 rounded-xl">
					<h1 className="text-2xl font-bold tracking-tight">Random Password Generator</h1>
					<p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
						Generates a random password containing at least one uppercase, lowercase, number and
						symbol.
					</p>
					<div className="mt-6 space-y-1.5">
						<Label>Password Length</Label>
						<Input
							type="number"
							id="lengthInput"
							value={length || 10}
							onChange={handleLengthChange}
							min="8"
							max="50"
						/>
					</div>
					<div className="flex gap-3 mt-4 place-items-end">
						<div className="flex-1 space-y-1.5">
							<Label>Generated Password</Label>
							<Input
								id="passwordOutput"
								type="text"
								value={password}
								className="font-mono"
								readOnly
							/>
						</div>
						<div>
							<Button
								variant={"secondary"}
								type="button"
								onClick={() => {
									const newPassword = generatePassword(length || 10);
									setPassword(newPassword);
									if (copyBtnRef.current) {
										copyBtnRef.current.innerHTML = "Copy and Save to browser";
									}
								}}
							>
								<RefreshCcw className="size-4" />
							</Button>
						</div>
					</div>
					<div className="flex w-full gap-2 mt-8">
						<Button
							variant="default"
							type="button"
							className="flex-1 flex gap-2"
							onClick={() => {
								navigator.clipboard.writeText(password);
								if (copyBtnRef.current) {
									copyBtnRef.current.innerHTML = "Copied!";
								}
								toast({
									description: "Password copied to your clipboard!",
								});
								// Add to previous passwords
								if (
									(prevPasswords.length > 0 &&
										prevPasswords[prevPasswords.length - 1].value !== password) ||
									prevPasswords.length === 0
								) {
									setPrevPasswords((v) => {
										v.push({
											datetime: new Date().toISOString(),
											value: password,
										});
										return v;
									});
								}
							}}
						>
							<ClipboardList className="size-4" />
							<span ref={copyBtnRef}>Copy and Save to browser</span>
						</Button>
						<Button
							variant="outline"
							type="button"
							className="bg-transparent"
							onClick={() => {
								navigator.clipboard.writeText(password);
								toast({
									description: "Password copied to your clipboard!",
								});
							}}
						>
							<span>Copy only</span>
						</Button>
					</div>
				</div>
			</div>
			<div className="max-w-[90%] m-auto mt-16 mb-8 rounded-md p-6 border">
				<div className="flex">
					<h2 className="flex-1 mb-4 font-medium">Previous Passwords</h2>
					<Button
						variant={"secondary"}
						className="border"
						onClick={() => {
							setPrevPasswords([]);
						}}
					>
						Clear all
					</Button>
				</div>
				{prevPasswords.length > 0 ? (
					prevPasswords
						.slice()
						.reverse()
						.map((entry) => (
							<div className="inline-block mt-1 mr-8" key={entry.datetime}>
								<button
									className="inline-block border rounded-md font-mono px-1 text-[90%] hover:border-foreground hover:text-foreground"
									onClick={() => {
										navigator.clipboard.writeText(entry.value);
										toast({
											description: "Password copied to your clipboard!",
										});
									}}
								>
									{entry.value}
								</button>
								<span className="text-xs text-muted-foreground">
									{" "}
									&mdash; {dateTimePretty(entry.datetime)}
								</span>
							</div>
						))
				) : (
					<></>
				)}
			</div>
		</BaseSidebarLayout>
	);
}
