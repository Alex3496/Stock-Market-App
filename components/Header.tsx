import React from 'react'
import Link from 'next/link'

import NavItems from './NavItems'
import UserDropdown from './general/UserDropdown'

const Header = ({ user }: { user: User | null }) => {
  return (
	<header className='sticky top-0 header'>
		<div className="container header-wrapper">
			<Link href="/" className='text-2xl font-bold'>
				Logo
			</Link>

			{/* Desktop Nav */}
			<nav className="hidden sm:block">
				<NavItems />
			</nav>

			{/* Mobile Nav */}
			<UserDropdown user={user} />

		</div>
	</header>
  )
}

export default Header
