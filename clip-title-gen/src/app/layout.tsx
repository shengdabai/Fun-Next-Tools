import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clip Title Gen — YouTube Title Generator for High CTR',
  description:
    'Generate high-CTR YouTube titles instantly. 10 proven title formulas, A/B testing suggestions, and thumbnail text — free for creators.',
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
