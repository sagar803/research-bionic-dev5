"use client"
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ChatStorage } from '@/lib/chatStorage';
import { MoreHorizontal, PlusCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/lib/hooks/use-generate-chatid';
import { motion } from 'framer-motion'

interface Chat {
  id: string;
  title: string;
  timestamp: string;
}

interface ChatGroup {
  [key: string]: Chat[];
}



const ChatSidebar: React.FC = ({ 

}) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { generateNewChatId , setCurrentChatId , currentChatId , updateSiebar } = useChat();
  const shouldAnimate = 0
  
  useEffect(() => {
    if (session?.user?.id) {
      loadChats();
    }
  }, [session?.user?.id , currentChatId , updateSiebar]);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      if (!session?.user?.id) return;
    
      const chatList = await ChatStorage.getChatTitles(session.user.id);
      setChats(chatList);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupChats = (chats: Chat[]): ChatGroup => {
    return chats.reduce((groups: ChatGroup, chat) => {
      const date = new Date(chat.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let group = 'Previous 7 Days';
      if (date.toDateString() === today.toDateString()) {
        group = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        group = 'Yesterday';
      }

      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(chat);
      return groups;
    }, {});
  };

  const groupedChats = groupChats(chats);

  const handleNewChat = () => {
    const newId = generateNewChatId();
    setCurrentChatId(newId);
  };

  return (
    <motion.div
      variants={{
        initial: {
          height: 0,
          opacity: 0
        },
        animate: {
          height: 'auto',
          opacity: 1
        }
      }}
      initial={shouldAnimate ? 'initial' : undefined}
      animate={shouldAnimate ? 'animate' : undefined}
      transition={{
        duration: 0.25,
        ease: 'easeIn'
      }}
      className="w-72 border-r bg-gray-100 h-full flex flex-col"
    >
      <div className="p-4 border-b">
        <Button 
          onClick={handleNewChat}
          className="w-full text-base font-medium py-3 px-4 bg-black text-white hover:bg-gray-900 rounded flex "
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          New chat
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {Object.entries(groupedChats).map(([group, groupChats]) => (
          <div key={group} className="mb-6">
            <h2 className="text-sm font-medium text-gray-500 mb-2">
              {group}
            </h2>
            <div className="space-y-1">
              {groupChats.map((chat) => (
                <div 
                  key={chat.id} 
                  className={`group flex items-center ${
                    currentChatId === chat.id ? 'bg-blue-100' : ''
                  }`}
                >
                  <div 
                    onClick={() => setCurrentChatId(chat.id)}
                    className="w-full text-left px-2 py-1.5 text-[15px] font-normal h-auto flex items-center"
                  >
                    <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                    {chat?.title}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {chats.length === 0 && (
          <div className="text-center text-gray-500 mt-4">
            No chats yet
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatSidebar;