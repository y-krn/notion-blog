/* eslint-disable @next/next/no-img-element */
import { Navbar } from 'flowbite-react'
import React from 'react'

const Header: React.FC = () => (
  <header>
    <Navbar fluid={true} rounded={true}>
      <Navbar.Brand href='/'>
        <img src='/logo.svg' className='mr-3 h-6 sm:h-9' alt='Logo' />
        <span className='self-center whitespace-nowrap text-xl font-semibold dark:text-white'>
          Next.js with Notion API
        </span>
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Navbar.Link href='/' active={true}>
          Home
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  </header>
)

export default Header
