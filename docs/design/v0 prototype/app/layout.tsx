import type { Metadata, Viewport } from 'next'
import { Inter, Archivo_Black } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// Archivo Black as a bold display font similar to Cubano
const archivoBlack = Archivo_Black({ 
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Stagecom | A Home for Your Improv Community',
  description: 'The community management platform for improv theaters, ensembles, and local performance communities. Manage shows, casting, lineups, and coordination in one place.',
  generator: 'v0.app',
  keywords: ['improv', 'theater', 'community', 'casting', 'lineup', 'show management', 'performance'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Stagecom | A Home for Your Improv Community',
    description: 'The community management platform for improv theaters, ensembles, and local performance communities.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#2B2926',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${archivoBlack.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
