import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Price Pilot — Short-Term Rental Pricing Analyzer',
  description: 'Get instant pricing recommendations and revenue projections for your Airbnb or short-term rental property.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
