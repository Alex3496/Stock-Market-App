"use client";

import * as React from "react";
import {
	Calculator,
	Calendar,
	CreditCard,
	Loader2,
	Settings,
	Smile,
	TrendingUp,
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
import Link from "next/link";
import { searchAssets } from "@/lib/actions/finnhub.actions";
import { useDebounce } from "@/hooks/usedebounce";

type SearchCommandProps = {
	visibility?: boolean;
	children?: React.ReactNode;
	initialStocks?: AssetWithWatchlistStatus[];
};

export function SearchCommand({
	visibility = false,
	children,
	initialStocks,
}: SearchCommandProps) {

	const [loading, setLoading] = React.useState(false);
	const [open, setOpen] = React.useState(visibility);
	const [searchTerm, setSearchTerm] = React.useState("");
	const [assets, setAssets] = React.useState<AssetWithWatchlistStatus[]>(initialStocks || []);

	const isSearchMode = !!searchTerm.trim();
	const displayAssets = isSearchMode ? assets : assets.slice(0, 10);

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


	const handleSearch = async () => {
		// If no search term, reset to initial assets
		if(!isSearchMode) return setAssets(initialStocks || []);

		setLoading(true);
		try{
			const results = await searchAssets(searchTerm.trim())
			setAssets(results);
		}catch {
			setAssets([]);
		} finally {
			setLoading(false);
		}
	}

	React.useEffect(()=> {
		debouncedSearch();
	},[searchTerm])

	const debouncedSearch = useDebounce(handleSearch, 300);

	const handleSelectAsset = () => {
		setOpen(false);
		setSearchTerm("");
		setAssets(initialStocks || []);
	}

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
			<CommandDialog open={open} onOpenChange={setOpen} className="search-dialog">
				<div className="search-field">
					<CommandInput onValueChange={setSearchTerm} placeholder="Type a stock or crypto symbol/name..."  className="search-input"/>
					{ loading && <Loader2 className="search-loader" /> }
				</div>
				<CommandList className="search-list">
					{ loading ? (<CommandEmpty>Loading...</CommandEmpty>) :
						displayAssets?.length === 0 ? (
							<div className="search-list-indicator">
								{ isSearchMode ? "No results found." : "Type to search stocks & crypto." }
							</div>
						) : (
							<ul>
								<div className="search-count">
									{ isSearchMode ? 'Search Results ' : 'Popular Assets ' }
									({  displayAssets.length || 0})
								</div>
								{displayAssets?.map((asset: AssetWithWatchlistStatus) => (
									<li key={asset?.symbol} className="search-item hover:bg-gray-600 pb-1 pt-1">
										<Link
											href={asset.type === 'crypto' ? `/crypto/${asset.symbol}` : `/stocks/${asset?.symbol}`}
											onClick={handleSelectAsset}
											className="search-item-link hover"
										>
											<TrendingUp className="h-4 w-4 text-gray-500" />
											<div className="flex-1">
												<div className="search-item-name">{asset?.name}</div>
												<div className="search-item-symbol text-sm text-gray-500">
													{asset?.symbol} | {asset?.exchange} | {asset?.type}
												</div>
											</div>
										</Link>
									</li>
								))}
							</ul>
						)
					}
				</CommandList>
			</CommandDialog>
		</>
	);
}
