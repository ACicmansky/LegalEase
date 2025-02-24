export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  created_at: Date;
  chat_id: string;
}

export interface Chat {
  id: string;
  title?: string;
  last_message?: string;
  created_at: Date;
  user: string;
  document?: string;
  folder?: string;
  messages: ChatMessage[];
}

export interface ChatFolder {
  id: string;
  name: string;
  isExpanded: boolean;
}
