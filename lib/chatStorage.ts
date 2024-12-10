// import { supabase } from "./supabase";

// export type ChatModelType = 'openai' | 'gpto1' | 'claude' | 'perplexity' | 'arxiv';
// export type ChatModelField = `${ChatModelType}_chat`;
// interface ChatMessage {
//     id: string;
//     display: React.ReactElement;
//     timestamp: string;
//   }

//   interface UserChats {
//     id: string;
//     user_id: string;
//     openai_chat: ChatMessage[];
//     gpto1_chat: ChatMessage[];
//     claude_chat: ChatMessage[];
//     perplexity_chat: ChatMessage[];
//     arxiv_chat: ChatMessage[];
//     created_at: string;
//     updated_at: string;
//   }
// export class ChatStorage {
//     private static async getUserChats(userId: string): Promise<UserChats | null> {
//       const { data, error } = await supabase
//         .from('user_chats')
//         .select('*')
//         .eq('user_id', userId)
//         .single();

//       if (error) {
//         console.error('Error fetching user chats:', error);
//         return null;
//       }

//       return data;
//     }

//     static async saveChat(
//         userId: string,
//         message: any,

//       ) {
//         const existingChats = await this.getUserChats(userId);
//         const modelChatField = `all_chat` as ChatModelField;

//         if (existingChats) {
//           const existingMessages = existingChats[modelChatField];
//           const updateData: Partial<UserChats> = {
//             [modelChatField]: [...existingMessages, message],
//             updated_at: new Date().toISOString()
//           };

//           const { error } = await supabase
//             .from('user_chats')
//             .update(updateData)
//             .eq('user_id', userId);

//           if (error) {
//             console.error('Error updating chat:', error);
//             throw error;
//           }
//         } else {
//           const initialChat: Partial<UserChats> = {
//             user_id: userId,
//             [modelChatField]: [message],
//             created_at: new Date().toISOString(),
//             updated_at: new Date().toISOString()
//           };

//           const { error } = await supabase
//             .from('user_chats')
//             .insert(initialChat);

//           if (error) {
//             console.error('Error creating chat:', error);
//             throw error;
//           }
//         }
//       }

//       static async getModelChat(
//         userId: string,

//       ): Promise<ChatMessage[]> {
//         const userChats = await this.getUserChats(userId);
//         if (!userChats) return [];

//         const modelChatField = `all_chat` as ChatModelField;
//         return userChats[modelChatField] || [];
//       }
//     }

import { supabase } from "./supabase";
import { nanoid } from 'nanoid';

interface ChatMessage {
    id: string;
    display: React.ReactElement;
    timestamp: string;
    chatId: string;
}

interface ChatData {
    messages: ChatMessage[];
    title: string;
    timestamp: string;
}

interface UserChats {
    id: string;
    user_id: string;
    all_chat: {
        [chatId: string]: ChatData;
    };
    created_at: string;
    updated_at: string;
}

export class ChatStorage {
    private static async getUserChats(userId: string): Promise<UserChats | null> {
        const { data, error } = await supabase
            .from('user_chats')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Error fetching user chats:', error);
            return null;
        }
        return data;
    }

    static async saveChat(userId: string, message: any, chatId: string) {
        const existingChats = await this.getUserChats(userId);
        
        const messageWithMeta = {
            id: nanoid(10),
            ...message,
            chatId,
            timestamp: new Date().toISOString(),
        };

        let updatedAllChat = existingChats?.all_chat || {};
        
        if (!updatedAllChat[chatId]) {
            // For new chat, generate title from first message
            const title = this.generateTitleFromMessage(message);
            updatedAllChat[chatId] = {
                messages: [],
                title,
                timestamp: new Date().toISOString()
            };
        }

        // Add message to the chat's message array
        updatedAllChat[chatId].messages.push(messageWithMeta);

        if (existingChats) {
            const { error } = await supabase
                .from('user_chats')
                .update({
                    all_chat: updatedAllChat,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('user_chats')
                .insert({
                    user_id: userId,
                    all_chat: updatedAllChat,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
        }

        return chatId;
    }

    static async getChatMessages(userId: string, chatId: string): Promise<ChatMessage[]> {
        const userChats = await this.getUserChats(userId);
        return userChats?.all_chat?.[chatId]?.messages || [];
    }

    static async getChatTitles(userId: string) {
        const userChats = await this.getUserChats(userId);
        if (!userChats?.all_chat) return [];

        return Object.entries(userChats.all_chat).map(([chatId, chatData]) => ({
            id: chatId,
            title: chatData.title,
            timestamp: chatData.timestamp
        })).sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }

    private static generateTitleFromMessage(message: any): string {
        try {
            const content = message?.display?.props?.children?.props?.children?.[0]?.props?.children;
            if (!content) return 'New Chat';
            
            // Split content into words and take first 3
            const words = content.split(' ').slice(0, 3).join(' ');
            return words || 'New Chat';
        } catch (error) {
            return 'New Chat';
        }
    }
}