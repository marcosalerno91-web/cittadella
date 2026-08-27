import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter } from 'next/font/google'

import * as copy from '@/content/copy'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['SOFT', 'WONK'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: copy.app.nome,
  description: copy.app.tagline,
}

export const viewport: Viewport = {
  themeColor: '#F4EDE2',
  width: 'device-width',
  initialScale: 1,
  // si lavora in due su un solo schermo: niente zoom accidentale
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
