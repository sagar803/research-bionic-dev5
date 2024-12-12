import { UIState } from '@/lib/chat/actions'
import { Session } from '@/lib/types'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import Link from 'next/link'
import { useSession } from 'next-auth/react';
import { useGlobalState } from '@/context/GlobalContext';
export interface ChatList {
  messages: UIState
  session?: Session
  isShared: boolean
}

export function ChatList({ messages, isShared }: ChatList) {
  const { data: session, status } = useSession();
  const { setIsOpenSidebar , isOpenSidebar } = useGlobalState();
  console.log('messages',messages);
  return messages.length ? (
    <div className={`relative mx-auto max-w-2xl grid auto-rows-max gap-8 px-4 ${(session && isOpenSidebar) ? "ml-[38%]" : ""} `}>
      {!isShared && !session ? (
        <>

        </>
      ) : null}

      {messages.map(message => (
        <div key={message?.id}>
          {message?.display}
        </div>
      ))}
    </div>
  ) : null
}
