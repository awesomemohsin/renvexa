import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RENVEXA · Property operations',
  description: 'Every property. One powerful platform.',
  applicationName: 'RENVEXA',
}

export const viewport: Viewport = {
  themeColor: '#123332',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
