import { Chat, ChatMessage, MessageType } from '@/types/chat';

const API_BASE = '/api';

export class ChatAPIService {
  static async createChat(title: string, document_id?: string): Promise<Chat> {
    const response = await fetch(`${API_BASE}/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, document_id }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }

  static async getAllChats(): Promise<Chat[]> {
    const response = await fetch(`${API_BASE}/chats`);

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }

  static async getChat(chatId: string): Promise<Chat> {
    const response = await fetch(`${API_BASE}/chats/${chatId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch chat');
    }

    return response.json();
  }

  static async deleteChat(chatId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/chats/${chatId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete chat');
    }
  }

  static async addMessage(chatId: string, content: string, type: MessageType): Promise<ChatMessage> {
    const response = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, type }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }

  /**
   * Processes a message and save AI response in database
   */
  static async processUserMessage(chatId: string, content: string): Promise<{ 
    message: ChatMessage, 
    guidance?: { 
      steps?: string[],
      relevantLaws?: string[],
      timeframe?: string,
      risks?: string[] 
    } 
  }> {
    try {
      const response = await fetch(`${API_BASE}/chats/${chatId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error processing message:', errorText);
        throw new Error(`Failed to process message: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('ChatService.processUserMessage error:', error);
      throw error;
    }
  }
}
