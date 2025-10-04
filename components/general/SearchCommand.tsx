"use client";

import * as React from "react";
import {
	Calculator,
	Calendar,
	CreditCard,
	Settings,
	Smile,
	User,
} from "lucide-react";

import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from "@/components/ui/command";

type SearchCommandProps = {
	visibility?: boolean;
	children?: React.ReactNode;
	initialStocks?: string[];
};

export function SearchCommand({
	visibility = false,
	children,
	initialStocks,
}: SearchCommandProps) {
	const [open, setOpen] = React.useState(visibility);

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};

		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	return (
		<>
			{children ? (
				<span onClick={() => setOpen(true)} className="cursor-pointer hover:text-yellow-500">{children}</span>
			) : (
				<p className="text-muted-foreground text-sm">
					Press{" "}
					<kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
						<span className="text-xs">⌘</span>J
					</kbd>
				</p>
			)}
			<CommandDialog open={open} onOpenChange={setOpen}>
				<CommandInput placeholder="Type a stock symbol or name..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Stocks">
						<CommandItem
							value="AAPL"
							onSelect={() => setOpen(false)}
						>
							<span>Apple</span>
						</CommandItem>
						<CommandItem
							value="GOOGL"
							onSelect={() => setOpen(false)}
						>
							<span>Alphabet</span>
						</CommandItem>
						<CommandItem
							value="MSFT"
							onSelect={() => setOpen(false)}
						>
							<span>Microsoft</span>
						</CommandItem>
					</CommandGroup>
				</CommandList>
			</CommandDialog>
		</>
	);
}
