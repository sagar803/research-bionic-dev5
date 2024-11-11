// @ts-nocheck

'use client'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useEffect, useState } from 'react'
import { useUIState, useAIState, useActions } from 'ai/rsc'
import { Message, Session } from '@/lib/types'
import { usePathname, useRouter } from 'next/navigation'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { useGlobalState } from '@/context/GlobalContext'
import { X } from 'lucide-react'
import axios from 'axios'
import { Button } from './ui/button'
import { IconsDocument } from './ui/icons'
import { nanoid } from 'nanoid'
import { UserMessage } from './stocks/message'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  session?: Session
  missingKeys: string[]
}

export function Chat({ id, className, session, missingKeys }: ChatProps) {
  const {
    selectedPdfUrl,
    setSelectedPdfUrl,
    pdfName,
    setPdfName,
    uploadedPdfUrls,
    setUploadedUrls
  } = useGlobalState()
  console.log("urls ===", uploadedPdfUrls)
  const router = useRouter()
  const path = usePathname()
  const [input, setInput] = useState('')
  const [aiState] = useAIState()
  const { submitUserMessage } = useActions()
  const [messages, setMessages] = useUIState<typeof AI>()
  const [summeryLoading, setSummeryLoading] = useState(false)
  const [state, setState] = useState('')

  const [_, setNewChatId] = useLocalStorage('newChatId', id)

  useEffect(() => {
    if (session?.user) {
      if (!path.includes('chat') && messages.length === 1) {
        window.history.replaceState({}, '', `/chat/${id}`)
      }
    }
  }, [id, path, session?.user, messages])

  useEffect(() => {
    const messagesLength = aiState.messages?.length
    if (messagesLength === 2) {
      router.refresh()
    }
  }, [aiState.messages, router])

  useEffect(() => {
    setNewChatId(id)
  })

  useEffect(() => {
    missingKeys.map(key => {
      toast.error(`Missing ${key} environment variable!`)
    })
  }, [missingKeys])

  const readPdfFile = async () => {
    if (!selectedPdfUrl || !pdfName) {
      return
    }

    setSummeryLoading(true)

    const content = (
      <div className="flex flex-col gap-2 max-w-[80%]">
        <p>The research PDF file</p>
        <div className="bg-zinc-200 flex items-center p-2 rounded-xl gap-2">
          <span className="bg-white p-2 rounded-lg flex items-center justify-center">
            <IconsDocument />
          </span>
          <span className="text-wrap">{pdfName.title}</span>
        </div>
      </div>
    )

    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{content}</UserMessage>
      }
    ])

    const formData = new FormData()
    formData.append('url', selectedPdfUrl)

    try {
      const res = await axios.post('/api/upload/pdf-to-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      if (res.data?.text) {
        const str = res.data?.text as string
        const data = [{ text: str }]
        const responseMessage = await submitUserMessage(
          'Please provide a summary, ',
          '',
          [],
          data,
          []
        )
        setMessages(currentMessages => [...currentMessages, responseMessage])
      }
    } catch (error) {
      console.log(error)
      toast.error('Error uploading pdf file.')
    }

    setSummeryLoading(false)
  }
  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
    useScrollAnchor()

  return (
    <>
      <div
        className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
        ref={scrollRef}
      >
        <div
          className={`transition duration-300 ${selectedPdfUrl ? '-translate-x-1/4' : 'translate-x-0'} pb-[200px] pt-4 md:pt-10 `}
          ref={messagesRef}
        >
          {messages.length ? (
            <ChatList messages={messages} isShared={false} session={session} />
          ) : (
            <EmptyScreen />
          )}
          <div className="w-full h-px" ref={visibilityRef} />
        </div>
        <ChatPanel
          id={id}
          input={input}
          setInput={setInput}
          isAtBottom={isAtBottom}
          scrollToBottom={scrollToBottom}
        />
      </div>
      <Card
        className={`bg-black fixed right-0 top-0 bottom-0 w-[45%] mt-16 transition ${selectedPdfUrl ? 'block' : 'hidden'}`}
      >
        <div className="flex justify-between items-center px-4">
          <Button
            className="bg-white text-black hover:opacity-85"
            variant={'outline'}
            onClick={readPdfFile}
            disabled={summeryLoading}
          >
            Summarize this PDF
          </Button>
          <X
            className="text-white m-4 cursor-pointer rounded-full border-2 border-gray-200"
            onClick={() => {
              setSelectedPdfUrl(null)
              setPdfName(null)
            }}
            size={24}
          />
        </div>
        <embed
          src={selectedPdfUrl}
          allowFullScreen={true}
          zoom
          title="arXiv Paper"
          width="100%"
          height="100%"
        ></embed>
      </Card>
    </>
  )
}
