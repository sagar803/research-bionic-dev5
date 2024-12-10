'use client'

import * as React from 'react'
import { nanoid } from 'nanoid'

interface ChatContext {
  currentChatId: string | null
  setCurrentChatId: (id: string | null) => void
  updateSiebar: any | null
  setUpdateSiebar: (id: any | null) => void
  generateNewChatId: () => string
  isLoading: boolean
}

const ChatContext = React.createContext<ChatContext | undefined>(undefined)

export function useChat() {
  const context = React.useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

interface ChatProviderProps {
  children: React.ReactNode
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [currentChatId, setCurrentChatId] = React.useState<any | null>(false)
  const [updateSiebar, setUpdateSiebar] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const newChatId = nanoid(6)
    if(!currentChatId)
    setCurrentChatId(newChatId)
    setIsLoading(false)
  }, [])

  const generateNewChatId = React.useCallback(() => {
    const newChatId = nanoid(6) 
    setCurrentChatId(newChatId)
 
    return newChatId
  }, [])

  if (isLoading) {
    return null
  }

  return (
    <ChatContext.Provider 
      value={{
        currentChatId,
        setCurrentChatId,
        generateNewChatId,
        updateSiebar,
        setUpdateSiebar,
        isLoading
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}