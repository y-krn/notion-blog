import React, { ReactNode } from 'react'
import Footer from '@/components/Layout/Footer'
import Header from '@/components/Layout/Header'

type LayoutProps = {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => (
  <>
    <div className='mx-auto max-w-3xl px-4 sm:px-6 xl:max-w-5xl xl:px-0'>
      <div className='flex h-screen flex-col justify-between'>
        <Header />
        {children}
        <Footer />
      </div>
    </div>
  </>
)

export default Layout
