
// @ts-nocheck
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/react'
import '@/app/globals.css'  // Ensure Tailwind is imported globally
import { cn } from '@/lib/utils'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { Providers } from '@/components/providers'
import { Header } from '@/components/header'
import { Toaster } from '@/components/ui/sonner'
import { GlobalStateProvider } from '@/context/GlobalContext'
import SessionWrapper from './SessionWrapper'
import ChatSidebar from '@/components/chat-sidebar'
import { signOut , useSession , signIn } from "next-auth/react";
export const metadata = {
  metadataBase: new URL(`https://${process.env.VERCEL_URL}`),
  title: {
    default: 'Diamond GenText',
    template: `%s - Diamond GenText`
  },
  description: 'Talk to your own research assistant',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  }
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'font-sans antialiased', 
          GeistSans.variable, 
          GeistMono.variable, 
          ' dark:bg-gray-900 text-gray-900 dark:text-white'
        )}
      >
        {/* Toast Notifications */}
        <Toaster position="top-center" />

        <SessionWrapper>
          <Providers
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
             <GlobalStateProvider>
             <div className="h-screen flex flex-col">
                <Header />
                <div className="flex-1 pt-8">
                <main className={`pt-16`}>
                    <div className="mx-auto max-w-8xl p-4">
                      {children}
                    </div>
                  </main>
                </div>
              </div>
            </GlobalStateProvider>
          </Providers>
        </SessionWrapper>

        <Analytics />
        <TailwindIndicator />
      </body>
    </html>
  )
}
