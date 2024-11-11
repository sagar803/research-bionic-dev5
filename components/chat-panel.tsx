
// @ts-nocheck
import * as React from 'react'
import { shareChat } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { IconShare } from '@/components/ui/icons'
import { FooterText } from '@/components/footer'
import { ChatShareDialog } from '@/components/chat-share-dialog'
import { useAIState, useActions, useUIState } from 'ai/rsc'
import type { AI } from '@/lib/chat/actions'
import { nanoid } from 'nanoid'
import { UserMessage } from './stocks/message'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useGlobalState } from '@/context/GlobalContext'

export interface ChatPanelProps {
    id?: string
    title?: string
    input: string
    setInput: (value: string) => void
    isAtBottom: boolean
    scrollToBottom: () => void
}

export function ChatPanel({
                              id,
                              title,
                              input,
                              setInput,
                              isAtBottom,
                              scrollToBottom
                          }: ChatPanelProps) {
    const [aiState] = useAIState()
    const [messages, setMessages] = useUIState<typeof AI>()
    const { submitUserMessage } = useActions()
    const [shareDialogOpen, setShareDialogOpen] = React.useState(false)
    const [showContent, setShowContent] = React.useState(true)
    const {selectedPdfUrl, setSelectedPdfUrl} = useGlobalState()

    const exampleMessages = [
        {
            heading: 'Impact of artificial intelligence on higher education',
            subheading: '',
            message: ``
        },
        {
            heading: 'Canadian demographics consuming digital media',
            subheading: '',
            message: ''
        },
        {
            heading: 'New marketing segments from immigrants to Canada',
            subheading: '',
            message: ''
        }
    ]

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setShowContent(false)
        }, 5000) // Content disappears after 5 seconds
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className={`transition duration-500 ${selectedPdfUrl ? '-translate-x-1/4' : 'translate-x-0'} fixed inset-x-0 bg-white/90 bottom-0 w-full duration-300 ease-in-out peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px] dark:from-10%`}>
            <ButtonScrollToBottom
                isAtBottom={isAtBottom}
                scrollToBottom={scrollToBottom}
            />

            <div className="mx-auto sm:max-w-2xl sm:px-4">
                {showContent && (
                    <img className="size-10 object-contain ml-auto mr-auto mb-10" src="/images/gemini.png" alt="gemini logo" />
                )}
                {messages.length === 0 && showContent && (
                    <div className="mb-24 grid sm:grid-cols-3 gap-2 sm:gap-4 px-4 sm:px-0">
                        {exampleMessages.map((example, index) => (
                            <div
                                key={example.heading}
                                className={cn(
                                    'cursor-pointer bg-zinc-50 text-zinc-950 rounded-2xl p-4 sm:p-6 hover:bg-zinc-100 transition-colors',
                                    index > 1 && 'hidden md:block'
                                )}
                            >
                                <div className="font-medium">{example.heading}</div>
                                <div className="text-sm text-zinc-800">
                                    {example.subheading}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {messages?.length >= 2 ? (
                    <div className="flex h-fit items-center justify-center">
                        <div className="flex space-x-2">
                            {id && title ? (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShareDialogOpen(true)}
                                    >
                                        <IconShare className="mr-2" />
                                        Share
                                    </Button>
                                    <ChatShareDialog
                                        open={shareDialogOpen}
                                        onOpenChange={setShareDialogOpen}
                                        onCopy={() => setShareDialogOpen(false)}
                                        shareChat={shareChat}
                                        chat={{
                                            id,
                                            title,
                                            messages: aiState.messages
                                        }}
                                    />
                                </>
                            ) : null}
                        </div>
                    </div>
                ) : null}

                <div className="grid gap-4 sm:pb-4">
                    <PromptForm input={input} setInput={setInput} />
                    <FooterText className="hidden sm:block" />
                </div>
            </div>
        </div>
    )
}
