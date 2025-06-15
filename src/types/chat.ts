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
  DocumentQuestion = "question_about_users_document",
  LegalGuidance = "legal_guidance",
  Clarification = "clarification",
  General = "general_legal_question",
}

// Message type for filtering and categorization
export enum MessageType {
  User = "user",
  Assistant = "assistant",
  Summary = "summary",
  Error = "error"
}

// Display optimized message type with user information
export interface ChatMessage {
  id: string;
  content: string;
  type: MessageType;
  created_at: Date | string;
  chat_id: string;
  sources?: MessageSource[];
  user_id: string;
}

// Extended message type for database and agent processing
export interface ChatMessageExtended extends ChatMessage {
  metadata?: {
    intent?: ConversationIntent;
    guidance?: LegalGuidance;
    followUpQuestions?: string[];
  };
}

export interface Chat {
  id: string;
  title?: string;
  created_at: Date;
  user_id: string;
  document_id?: string;
  folder_id?: string;
  messages: ChatMessage[];
}

export interface ChatFolder {
  id: string;
  name: string;
  isExpanded: boolean;
}
