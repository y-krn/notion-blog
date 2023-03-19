import React, { ReactNode } from 'react'
import Footer from '@/components/Layout/Footer'
import Header from '@/components/Layout/Header'

type LayoutProps = {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => (
  <>
    <Header />
    <main>{children}</main>
    <Footer />
  </>
)

export default Layout
