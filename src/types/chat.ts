export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  created_at: Date;
  chat_id: string;
  user_id: string;
  sources?: Array<{
    title: string;
    page: number;
  }>;
}

export interface Chat {
  id: string;
  title?: string;
  last_message?: string;
  created_at: Date;
  user_id: string;
  document?: string;
  folder?: string;
  messages: ChatMessage[];
}

export interface ChatFolder {
  id: string;
  name: string;
  isExpanded: boolean;
}
