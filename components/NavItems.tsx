"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS } from "@/lib/constants";
import { SearchCommand } from "./general/SearchCommand";

const NavItems = () => {
	const pathname: string = usePathname() || "/";

	const isActive = (path: string): boolean => {
		if (path === "/") {
			return pathname === "/";
		}
		return pathname.startsWith(path);
	};

	return (
		<ul className="flex flex-col sm:flex-row p2 gap-3 sm:gap-10 font-medium">
			{NAV_ITEMS.map((item) => {
				if (item.title === "Search") {
					return (
						<li key={item.href}>
							<SearchCommand
								initialStocks={[
									{
										symbol: "BTCUSD",
										name: "Bitcoin",
										exchange: "Crypto",
										type: "crypto",
										isInWatchlist: false,
									},
									{
										symbol: "ETHUSD",
										name: "Ethereum",
										exchange: "Crypto",
										type: "crypto",
										isInWatchlist: false,
									},
									{
										symbol: "AAPL",
										name: "Apple Inc.",
										exchange: "NASDAQ",
										type: "stock",
										isInWatchlist: false,
									},
									{
										symbol: "GOOGL",
										name: "Alphabet Inc.",
										exchange: "NASDAQ",
										type: "stock",
										isInWatchlist: false,
									},
									{
										symbol: "MSFT",
										name: "Microsoft Corporation",
										exchange: "NASDAQ",
										type: "stock",
										isInWatchlist: false,
									},
									{
										symbol: "AMZN",
										name: "Amazon.com Inc.",
										exchange: "NASDAQ",
										type: "stock",
										isInWatchlist: false,
									},
									{
										symbol: "TSLA",
										name: "Tesla Inc.",
										exchange: "NASDAQ",
										type: "stock",
										isInWatchlist: false,
									},
									{
										symbol: "SOLUSD",
										name: "Solana",
										exchange: "Crypto", 
										type: "crypto",
										isInWatchlist: false,
									},
								]}
							>
								<span>Search</span>
							</SearchCommand>
						</li>
					);
				}

				return (
					<li key={item.href}>
						<Link
							href={item.href}
							className={`hover:text-yellow-500 transition-colors ${
								isActive(item.href) ? "text-gray-100" : ""
							}`}
						>
							{item.title}
						</Link>
					</li>
				);
			})}
		</ul>
	);
};

export default NavItems;
