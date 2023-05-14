import { Analytics } from '@vercel/analytics/react'
import type { AppProps } from 'next/app'
import React from 'react'
import Layout from '@/components/Layout/Layout'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  React.useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://platform.twitter.com/widgets.js'
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])
  return (
    <Layout>
      <Component {...pageProps} />
      <Analytics />
    </Layout>
  )
}
