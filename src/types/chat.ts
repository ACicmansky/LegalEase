export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  sources?: Array<{
    title: string;
    page: number;
  }>;
}

export interface Chat {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp: Date;
  documentName?: string;
  messages: ChatMessage[];
}

export interface ChatFolder {
  id: string;
  name: string;
  isExpanded: boolean;
}
