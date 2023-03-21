/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import React from 'react'

const Header: React.FC = () => (
  <header>
    <nav className='flex sm:justify-center space-x-4'>
      {[
        ['Home', '/'],
        ['Team', '/team'],
        ['Projects', '/projects'],
        ['Reports', '/reports'],
      ].map(([title, url]) => (
        <Link
          key={url}
          href={url}
          className='rounded-lg px-3 py-2 text-slate-700 font-medium hover:bg-slate-100 hover:text-slate-900'
        >
          {title}
        </Link>
      ))}
    </nav>
  </header>
)

export default Header
