import { AudioProvider } from '@/components/AudioProvider'
import { Layout } from '@/components/Layout'

import { Analytics } from '@vercel/analytics/react';


import kv from "@vercel/kv";


import '@/styles/tailwind.css'
import 'focus-visible'

export const metadata = {
  title: 'Cashed.dev',
  description: 'Weekly conversations about the business of starting a software company.',
}

export default async function RootLayout({ children }) {

  const hideCommits = await kv.get("hide_commits") || {};
  const drewCommits = await kv.get("drew_commits") || {};
  const jacobCommits = await kv.get("jacob_commits") || {};


  return (
    <html className="bg-white antialiased" lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://cdn.fontshare.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&display=swap"
        />
      </head>

      <body><AudioProvider><Layout drewCommits={drewCommits} hideCommits={hideCommits} jacobCommits={jacobCommits}>{children}</Layout></AudioProvider><Analytics /></body>
    </html>
  )
}
