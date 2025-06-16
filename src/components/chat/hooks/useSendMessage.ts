import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ChatAPIService } from '@/lib/api/chatAPIService';
import { ChatMessage, MessageType } from '@/types/chat';
import { createChatTitle } from '@/lib/agents/chatTitleCreationAgent';

interface SendMessageHookProps {
  chatId?: string;
  handleCreateMessage: (message: ChatMessage) => Promise<void>;
  replacePlaceholderWithMessage: (placeholderId: string, message: ChatMessage) => void;
  removePlaceholderMessage: (placeholderId: string) => void;
  onTitleCreated?: (title: string) => void;
}

export function useSendMessage({
  chatId,
  handleCreateMessage,
  replacePlaceholderWithMessage,
  removePlaceholderMessage,
  onTitleCreated
}: SendMessageHookProps) {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations();

  const sendMessage = useCallback(async (message: string) => {
    if (!chatId || !message.trim()) return;

    setIsLoading(true);
    // Generate a temporary ID for the placeholder message
    const placeholderMessageId = `placeholder-${Date.now()}`;

    try {
      // Check if this is the first message for this chat by fetching current count
      const chat = await ChatAPIService.getChat(chatId);
      const isFirstMessage = !chat.messages || chat.messages.length === 0;

      if (isFirstMessage) {
        const title = await createChatTitle(chatId, message);
        // Notify parent component about the new title
        if (onTitleCreated) {
          onTitleCreated(title);
        }
      }

      // First add the user message
      const userMessage = await ChatAPIService.addMessage(chatId, message, MessageType.User);
      await handleCreateMessage(userMessage);

      // Add a placeholder AI message immediately
      const placeholderMessage: ChatMessage = {
        id: placeholderMessageId,
        chat_id: chatId,
        content: t("chat.thinking"),
        type: MessageType.Placeholder,
        created_at: new Date().toISOString(),
        user_id: "system" // Using 'system' as a consistent value for system-generated messages
      };

      await handleCreateMessage(placeholderMessage);

      try {
        // Process the user message and get the AI response
        // The API will return either the successful response or a fallback error message
        const aiMessage = await ChatAPIService.processUserMessage(chatId, message);

        // Replace the placeholder message with the AI response (success or error from API)
        replacePlaceholderWithMessage(placeholderMessageId, aiMessage);
      } catch (error) {
        // This only happens if there's a network/API failure (not AI processing error)
        console.error("API call failed:", error);

        // In case of API failure, remove the placeholder message
        removePlaceholderMessage(placeholderMessageId);
        
        // Show a generic error toast
        toast.error(t("chat.failedToSend"));
      }
    } catch (error) {
      console.error("Failed to send message:", error);

      // Remove placeholder if it exists
      removePlaceholderMessage(placeholderMessageId);
      
      toast.error(t("chat.failedToSend"));
    } finally {
      setIsLoading(false);
    }
  }, [chatId, handleCreateMessage, replacePlaceholderWithMessage, removePlaceholderMessage, onTitleCreated, t]);

  return { isLoading, sendMessage };
}
