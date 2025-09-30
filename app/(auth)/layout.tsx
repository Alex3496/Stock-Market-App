
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const layout = ({ children } : { children: React.ReactNode }) => {
  return (
	<main className='auth-layout'>
		<section className='auth-left-section scrollbar-hide-defaults min-h-screen'>
			<Link href='/' className='auth-logo'>Logo</Link>
			<div className="pb-6 lg:pb-8 flex-1">
				{children}
			</div>
		</section>
		<section className="auth-right-section">
			<div className="z-10 relative lg:mt-4 lg:mb-16">
				<blockquote className='auth-blockquote'>
					<p className='text-2xl lg:text-3xl font-semibold mb-4'>"The stock market is a device for transferring money from the impatient to the patient."</p>
					<footer className='text-lg'>- Warren Buffett</footer>
				</blockquote>
			</div>
			<div className='flex-1 relative'>
				<Image src="/assets/images/dashboard.png" alt="Dashboard Image" width={1440} height={1150} className='auth-dashbpard-preview absolute top-0' />
			</div>
		</section>
	</main>
  )
}

export default layout
