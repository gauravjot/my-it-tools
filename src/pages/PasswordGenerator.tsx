import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Sidebar from "@/features/Sidebar";
import {Clipboard, RefreshCcw} from "lucide-react";
import {useEffect, useRef, useState} from "react";
import {Helmet} from "react-helmet";
import {useNavigate} from "react-router-dom";

export default function PasswordGenerator() {
	const [password, setPassword] = useState("");
	const [length, setLength] = useState<number | null>(null); // Default length of password
    const copyBtnRef = useRef<HTMLButtonElement>(null);
	const navigate = useNavigate();

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
		<>
			<Helmet>
				<title>Password Generator</title>
			</Helmet>
			<div className="flex relative">
				<div className="min-w-72 border-r dark:border-zinc-800 h-screen max-h-screen overflow-y-auto static">
					<Sidebar />
				</div>
				<div className="max-w-lg mx-auto h-screen flex place-items-center">
					<div className="bg-white dark:bg-zinc-900 w-full rounded-xl p-8 m-8 shadow-md">
						<h1 className="text-2xl tracking-tight font-bold">Random Password Generator</h1>
						<p className="my-3 text-zinc-700 dark:text-zinc-300 text-sm">
							Generates a random password containing at least one uppercase, lowercase, number and
							symbol.
						</p>
                        <div className="space-y-1">
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
						<div className="flex place-items-end gap-3 mt-3">
							<div className="flex-1 space-y-1">
                                <Label>Generated Password</Label>
								<Input
									id="passwordOutput"
									type="text"
									value={password}
									readOnly
								/>
							</div>
							<div>
								<Button
									variant={"secondary"}
									type="button"
                                    ref={copyBtnRef}
									onClick={(e) => {
										navigator.clipboard.writeText(password);
                                        e.currentTarget.innerHTML = 'Copied';
									}}
								>
                                    Copy
                                </Button>
							</div>
						</div>
						<Button
							variant="default"
							type="button"
                            className="flex gap-2 w-full mt-5"
							onClick={() => {
								const newPassword = generatePassword(length || 10);
								setPassword(newPassword);
                                if (copyBtnRef.current) {
                                    copyBtnRef.current.innerHTML = 'Copy';
                                }
							}}
						>
                            <RefreshCcw className="size-4"/><span>Generate</span>
                        </Button>
					</div>
				</div>
			</div>
		</>
	);
}
