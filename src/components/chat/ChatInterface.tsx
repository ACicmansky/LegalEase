'use client';

import { useEffect } from 'react';

// Import our custom hooks and components
import { useMessages } from './hooks/useMessages';
import { useSendMessage } from './hooks/useSendMessage';
import { useFollowUpHandler } from './hooks/useFollowUpHandler';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ChatMessage } from '@/types/chat';

interface ChatInterfaceProps {
  chatId?: string;
  ref?: React.RefObject<ChatInterfaceRef | null>;
  isDocumentAnalyzing?: boolean;
  onTitleCreated?: (title: string) => void;
}

export interface ChatInterfaceRef {
  handleCreateMessage: (newChatMessage: ChatMessage) => Promise<void>;
}

export function ChatInterface({ chatId, ref, isDocumentAnalyzing = false, onTitleCreated }: ChatInterfaceProps) {
  // Use our extracted hooks
  const {
    messages,
    handleCreateMessage,
    replacePlaceholderWithMessage,
    removePlaceholderMessage
  } = useMessages(chatId);

  const { isLoading, sendMessage } = useSendMessage({
    chatId,
    handleCreateMessage,
    replacePlaceholderWithMessage,
    removePlaceholderMessage,
    onTitleCreated
  });

  // Handle follow-up questions
  useFollowUpHandler(chatId, sendMessage);

  // Set up ref for external control of the component
  useEffect(() => {
    if (ref) {
      ref.current = {
        handleCreateMessage
      };
    }
  }, [ref, handleCreateMessage]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages display component */}
      <MessageList 
        messages={messages} 
        isDocumentAnalyzing={isDocumentAnalyzing} 
      />

      {/* Chat input component */}
      <ChatInput 
        onSendMessage={sendMessage} 
        isLoading={isLoading} 
      />
    </div>
  );
}
