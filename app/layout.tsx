import type { Metadata, Viewport } from 'next'
import './globals.css'
import '../styles/nprogress-custom.css'
import { Providers } from './providers'
import Toaster from '@/components/ui/Toaster'
import Navbar from '@/components/layout/Navbar'
import NavigationProgress from '@/components/ui/NavigationProgress'

export const metadata: Metadata = {
  title: 'NutriSphere - Nutrisi untuk Semua Kantong',
  description: 'Demokratisasi nutrisi untuk mahasiswa Indonesia: Budget-friendly recipes, AI-powered nutrition scanning, dan gamifikasi hemat sehat',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NutriSphere',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  formatDetection: {
    telephone: false,
  },
  keywords: [
    'nutrition',
    'Indonesian students',
    'budget recipes',
    'AI nutrition',
    'OCR food labels',
    'gamification health',
    'NutriGotchi',
  ],
  authors: [{ name: 'NutriSphere Team' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'NutriSphere',
    title: 'NutriSphere - Nutrisi untuk Semua Kantong',
    description: 'Demokratisasi nutrisi untuk setiap kantong mahasiswa',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#10b981',
  viewportFit: 'cover', // Enable safe area env variables for mobile
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/icons/icon-192x192.svg" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
      </head>
      <body className="antialiased">
        <NavigationProgress />
        <Providers>
          <Navbar />
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
