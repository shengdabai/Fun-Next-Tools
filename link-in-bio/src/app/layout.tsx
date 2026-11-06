import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Link In Bio — Create Your Personal Link Page',
  description: 'Build your personal link page in seconds. No account needed. Export as standalone HTML.',
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
