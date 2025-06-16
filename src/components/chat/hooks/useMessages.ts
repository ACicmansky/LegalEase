import { useState, useEffect, useCallback } from 'react';
import { ChatAPIService } from '@/lib/api/chatAPIService';
import { ChatMessage, ChatMessageExtended } from '@/types/chat';

export function useMessages(chatId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Load initial messages
  useEffect(() => {
    const isMounted = { current: true };

    const loadMessages = async () => {
      if (!chatId) return;

      try {
        const chat = await ChatAPIService.getChat(chatId);
        if (isMounted.current && chat.messages) {
          setMessages(chat.messages.sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          ));
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();

    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [chatId]);

  // Add new message
  const handleCreateMessage = useCallback(async (newChatMessage: ChatMessage | ChatMessageExtended) => {
    // Ensure the message has valid content before adding to state
    if (newChatMessage && typeof newChatMessage.content === 'string' && newChatMessage.content.trim()) {
      setMessages((prevMessages) => {
        // Don't add duplicate messages
        if (prevMessages.some(msg => msg.id === newChatMessage.id)) {
          return prevMessages;
        }
        return [...prevMessages, newChatMessage];
      });
    } else {
      console.error('Attempted to add invalid message:', newChatMessage);
    }
  }, []);

  // Replace placeholder with actual message
  const replacePlaceholderWithMessage = useCallback((placeholderId: string, newMessage: ChatMessage) => {
    setMessages((prevMessages) => {
      const placeholderExists = prevMessages.some(msg => msg.id === placeholderId);
      
      // Only update if the placeholder still exists
      if (placeholderExists) {
        return prevMessages.map(msg =>
          msg.id === placeholderId ? { ...newMessage, id: newMessage.id } : msg
        );
      }
      
      // If placeholder doesn't exist (unlikely edge case), add as new message
      return [...prevMessages, newMessage];
    });
  }, []);

  // Remove placeholder message (used for error handling)
  const removePlaceholderMessage = useCallback((placeholderId: string) => {
    setMessages((prevMessages) => {
      const placeholderExists = prevMessages.some(msg => msg.id === placeholderId);
      
      // Only filter if needed
      return placeholderExists
        ? prevMessages.filter(msg => msg.id !== placeholderId)
        : prevMessages;
    });
  }, []);

  return {
    messages,
    setMessages,
    handleCreateMessage,
    replacePlaceholderWithMessage,
    removePlaceholderMessage
  };
}
