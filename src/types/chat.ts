// Basic source type for frontend display
export interface MessageSource {
  title: string;
  page?: number;
  section?: string;
  text?: string;
}

// Legal guidance structure for agent processing
export interface LegalGuidance {
  steps: string[];
  relevantLaws: string[];
  timeframe: string;
  risks: string[];
}

// Intent classification for agent processing
export enum ConversationIntent {
  DocumentQuestion = "document_question",
  LegalGuidance = "legal_guidance",
  Clarification = "clarification",
  General = "general",
}

// Base message type for frontend display (minimal fields needed)
export interface BaseMessage {
  id: string;
  content: string;
  is_user: boolean;
  created_at: Date | string;
  chat_id: string;
  sources?: MessageSource[];
}

// Display optimized message type with user information
export interface ChatMessage extends BaseMessage {
  user_id: string;
}

// Extended message type for database and agent processing
export interface MessageRecord extends BaseMessage {
  user_id?: string;
  metadata?: {
    intent?: ConversationIntent;
    guidance?: LegalGuidance;
    followUpQuestions?: string[];
  };
}

export interface Chat {
  id: string;
  title?: string;
  last_message?: string;
  created_at: Date;
  user_id: string;
  document_id: string;
  folder_id?: string;
  messages: ChatMessage[];
}

export interface ChatFolder {
  id: string;
  name: string;
  isExpanded: boolean;
}
