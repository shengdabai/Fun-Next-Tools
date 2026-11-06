import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Meeting Cost Clock — See What Your Meeting Really Costs',
  description:
    'Real-time meeting cost calculator. See exactly how much money is being spent while you meet. Make your next meeting count.',
  openGraph: {
    title: 'Meeting Cost Clock',
    description: 'Real-time meeting cost calculator. See what your meeting really costs.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
