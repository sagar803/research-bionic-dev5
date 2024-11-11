'use client'

import * as React from 'react'
// import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ThemeProviderProps } from 'next-themes/dist/types'
import { SidebarProvider } from '@/lib/hooks/use-sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import {ModelProvider} from "@/app/context/ModelContext";

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (

      <SidebarProvider>
          <ModelProvider>
        <TooltipProvider>{children}</TooltipProvider>
            </ModelProvider>
      </SidebarProvider>

  )
}
