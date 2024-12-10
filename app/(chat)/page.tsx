import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
import { Session } from '@/lib/types'
import { getMissingKeys } from '../actions'
import { ModelProvider } from '../context/ModelContext'

export const metadata = {
  title: 'Diamond AI Chatbot'
}

export default async function IndexPage() {
  const id = nanoid()
  const session:any = true
  const missingKeys = await getMissingKeys()

  return (
    <AI initialAIState={{ chatId: id, messages: [] }}>
      <Chat id={id} session={session} missingKeys={missingKeys} />
    </AI>

  )
}
