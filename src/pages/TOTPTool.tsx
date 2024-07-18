import {useToast} from "@/components/ui/use-toast";
import useLocalStorage from "@/hooks/useLocalStorage";
import {dateTimePretty} from "@/lib/dateTimeUtils";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import BaseSidebarLayout from "./_layout";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Save} from "lucide-react";
import {TOTP} from "totp-generator";
import {Progress} from "@/components/ui/progress";

interface TOTPEntry {
	value: string;
	datetime: string;
	name?: string;
}

export default function TOTPTool() {
	const [totp, setTotp] = useLocalStorage<TOTPEntry>("totp", {
		value: "JBSWY3DPEHPK3PXP",
		datetime: new Date().toISOString(),
	});
	const [prevTotp, setPrevTotp] = useLocalStorage<TOTPEntry[]>("prevTotp", []);
	const [timeRemaining, setTimeRemaining] = useState<number>(0);
	const navigate = useNavigate();
	const {toast} = useToast();
	const otp = TOTP.generate(totp.value);
	const nextOtp = TOTP.generate(totp.value, {timestamp: otp.expires + 1});

	// Update password whenever length changes
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		let paramValue;
		if (totp.value.length <= 0) {
			paramValue = urlParams.get("totp") || "";
			if (paramValue.length > 0) {
				setTotp({value: paramValue, datetime: new Date().toISOString()});
			}
		} else {
			paramValue = totp.value;
		}
		// Update URL with query parameter
		urlParams.set("totp", paramValue + "");
		if (urlParams.get("totp") !== paramValue) {
			navigate({search: urlParams.toString()});
		}
	}, [totp, navigate, setTotp]);

	// Function to handle input change
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const val = event.target.value;
		if (val.length > 0) {
			setTotp({value: val, datetime: new Date().toISOString()});
		}
	};

	// Refresh when timestamp gets bigger than expires
	useEffect(() => {
		const interval = setInterval(() => {
			if (otp.expires < Date.now()) {
				setTotp({value: totp.value, datetime: new Date().toISOString()});
			}
		}, 1000);
		return () => clearInterval(interval);
	}, [otp.expires, totp.value, setTotp]);

	// Update time remaining
	useEffect(() => {
		const interval = setInterval(() => {
			const remaining = (otp.expires - Date.now()) / 1000;
			setTimeRemaining(remaining > 0 ? remaining : 30);
		}, 200);
		return () => clearInterval(interval);
	}, [otp.expires]);

	return (
		<BaseSidebarLayout title="TOTP Tool">
			<div className="flex max-w-lg mx-auto mt-12 place-items-center">
				<div className="w-full p-8 m-8 bg-white shadow-md dark:bg-zinc-900 rounded-xl">
					<h1 className="text-2xl font-bold tracking-tight">TOTP tool</h1>
					<p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
						Enter the token to see your one-time password and copy it to your clipboard.
					</p>
					<div className="mt-4 space-y-1">
						<Label>Token</Label>
						<Input type="text" id="lengthInput" value={totp.value} onChange={handleChange} />
					</div>
					<div className="mt-4 space-y-1">
						<Label>One-Time Password</Label>
						<div className="flex gap-3 place-items-center">
							<div className="flex justify-center w-10 text-sm place-items-center bg-muted rounded-xl aspect-square">
								{Math.floor(timeRemaining)}
							</div>
							<Button
								className="flex flex-col flex-1 p-0 !pb-0 bg-accent/60"
								variant={"ghost"}
								onClick={() => {
									navigator.clipboard.writeText(otp.otp);
									toast({
										description: "OTP copied to clipboard.",
									});
								}}
							>
								<div className="flex-1 pt-2.5">{otp.otp}</div>
								<Progress
									className="h-1 bg-transparent rounded-t-none rounded-b-md"
									value={timeRemaining}
									max={30}
								/>
							</Button>
							<Button
								variant={"ghost"}
								className="text-muted-foreground"
								onClick={() => {
									navigator.clipboard.writeText(nextOtp.otp);
									toast({
										description: "OTP copied to clipboard.",
									});
								}}
							>
								{nextOtp.otp}
							</Button>
						</div>
					</div>
					<Button
						variant="default"
						type="button"
						className="flex w-full gap-2 mt-8"
						onClick={() => {
							setPrevTotp([...prevTotp, totp]);
						}}
					>
						<Save className="size-4" />
						<span>Save to browser</span>
					</Button>
				</div>
			</div>
			<div className="max-w-[90%] m-auto mt-16 mb-8 rounded-md p-6 border">
				<div className="flex">
					<h2 className="flex-1 mb-4 font-medium">Previous TOTP</h2>
					<Button
						variant={"secondary"}
						className="border"
						onClick={() => {
							setPrevTotp([]);
						}}
					>
						Clear all
					</Button>
				</div>
				{prevTotp.length > 0 ? (
					prevTotp
						.slice()
						.reverse()
						.map((entry) => (
							<div className="inline-block mt-1 mr-8" key={entry.datetime}>
								<button
									className="inline-block border rounded-md font-mono px-1 text-[90%] hover:border-foreground hover:text-foreground"
									onClick={() => {
										setTotp(entry);
										toast({
											description: "TOTP inserted into the tool.",
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
