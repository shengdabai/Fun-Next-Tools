import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Newsletter Digest — Turn RSS Feeds Into Beautiful Digests',
  description: 'Aggregate multiple RSS feeds and generate ready-to-send newsletter digests in seconds.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
