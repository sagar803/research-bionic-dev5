'use client'

import * as React from 'react'
// import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ThemeProviderProps } from 'next-themes/dist/types'
import { SidebarProvider } from '@/lib/hooks/use-sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ModelProvider } from '@/app/context/ModelContext'
import { ChatProvider } from '@/lib/hooks/use-generate-chatid'

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <ChatProvider>
      <SidebarProvider>
        <ModelProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ModelProvider>
      </SidebarProvider>
    </ChatProvider>
  )
}
