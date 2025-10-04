'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { NAV_ITEMS } from '@/lib/constants'
import { SearchCommand } from './general/SearchCommand'


const NavItems = () => {

	const pathname: string = usePathname() || "/";

	const isActive = (path: string): boolean => {
		if(path === "/") {
			return pathname === "/";
		}
		return pathname.startsWith(path);
	}


  	return (
		<ul className='flex flex-col sm:flex-row p2 gap-3 sm:gap-10 font-medium'>
			{NAV_ITEMS.map((item) => {

				if(item.title === "Search") {
					return (
						<li key={item.href}>
							<SearchCommand visibility={false}>
								<span>Search</span>
							</SearchCommand>
						</li>
					);
				}

				return (
					<li key={item.href}>
						<Link href={item.href} className={`hover:text-yellow-500 transition-colors ${isActive(item.href) ? 'text-gray-100' : ''}`}>
							{item.title}
						</Link>
					</li>
				);
			})}
		</ul>
  	)
}

export default NavItems
