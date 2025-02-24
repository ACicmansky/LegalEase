import { Chat, ChatMessage } from '@/types/chat';

const API_BASE = '/api';

export class ChatService {
  static async createChat(title: string, documentName?: string): Promise<Chat> {
    const response = await fetch(`${API_BASE}/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, documentName }),
    });

    if (!response.ok) {
      throw new Error('Failed to create chat');
    }

    return response.json();
  }

  static async getAllChats(): Promise<Chat[]> {
    const response = await fetch(`${API_BASE}/chats`);

    if (!response.ok) {
      throw new Error('Failed to fetch chats');
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

  static async addMessage(chatId: string, content: string): Promise<ChatMessage> {
    const response = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Failed to add message');
    }

    return response.json();
  }
}
