import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Thread Forge — Turn Long Posts Into Twitter Threads',
  description: 'Automatically split long articles and blog posts into perfectly sized Twitter/X threads. Free to use, no sign-up required.',
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
