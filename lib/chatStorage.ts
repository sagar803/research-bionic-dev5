import { supabase } from "./supabase";

export type ChatModelType = 'openai' | 'gpto1' | 'claude' | 'perplexity' | 'arxiv';
export type ChatModelField = `${ChatModelType}_chat`;
interface ChatMessage {
    id: string;
    display: React.ReactElement;
    timestamp: string;
    model: 'openai' | 'gpto1' | 'claude' | 'perplexity' | 'arxiv';
  }
  
  interface UserChats {
    id: string;
    user_id: string;
    openai_chat: ChatMessage[];
    gpto1_chat: ChatMessage[];
    claude_chat: ChatMessage[];
    perplexity_chat: ChatMessage[];
    arxiv_chat: ChatMessage[];
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
  
    static async saveChat(
        userId: string,
        message: any,
        model: any
      ) {
        const existingChats = await this.getUserChats(userId);
        const modelChatField = `${model}_chat` as ChatModelField;
    
        if (existingChats) {
          const existingMessages = existingChats[modelChatField];
          const updateData: Partial<UserChats> = {
            [modelChatField]: [...existingMessages, message],
            updated_at: new Date().toISOString()
          };
    
          const { error } = await supabase
            .from('user_chats')
            .update(updateData)
            .eq('user_id', userId);
    
          if (error) {
            console.error('Error updating chat:', error);
            throw error;
          }
        } else {
          const initialChat: Partial<UserChats> = {
            user_id: userId,
            [modelChatField]: [message],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
    
          const { error } = await supabase
            .from('user_chats')
            .insert(initialChat);
    
          if (error) {
            console.error('Error creating chat:', error);
            throw error;
          }
        }
      }
  
      static async getModelChat(
        userId: string,
        model: any
      ): Promise<ChatMessage[]> {
        const userChats = await this.getUserChats(userId);
        if (!userChats) return [];
    
        const modelChatField = `${model}_chat` as ChatModelField;
        return userChats[modelChatField] || [];
      }
    }