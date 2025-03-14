'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { ArrowUp } from 'lucide-react';

import { ChatService } from '@/lib/api/chatService';
import { ChatMessage } from '@/types/chat';
import { Message } from './Message';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface ChatInterfaceProps {
  chatId?: string;
  onSendMessage: (message: string) => Promise<void>;
  ref?: React.RefObject<ChatInterfaceRef | null>;
  isDocumentAnalyzing?: boolean;
}

export interface ChatInterfaceRef {
  handleCreateMessage: (newChatMessage: ChatMessage) => Promise<void>;
}

export function ChatInterface({ chatId, onSendMessage, ref, isDocumentAnalyzing = false }: ChatInterfaceProps) {
  const t = useTranslations();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMessages = async () => {
      if (!chatId) return;     
      
      setIsLoadingMessages(true);
      try {
        const chat = await ChatService.getChat(chatId);
        if (chat.messages) {
          setMessages(chat.messages);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [chatId]);

  useEffect(() => {
    if (ref) {
      ref.current = {
        handleCreateMessage
      };
    }
  }, [ref, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await onSendMessage(inputValue);
      setInputValue('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMessage = async (newMessage: ChatMessage) => {
    try {
      setMessages([...messages, newMessage]);
    } catch (error) {
      console.error('Failed to create message:', error);
      toast(t('chat.failedToLoad'));
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {isDocumentAnalyzing && (
              <div className="flex justify-center my-4">
                <Spinner size="medium">
                  <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('chat.analyzingDocument')}</span>
                </Spinner>
              </div>
            )}
            {messages.map((message) => (
              <Message key={message.id} {...message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="bg-transparent py-4 px-4 md:px-8 flex-shrink-0">
        <div className="max-w-2xl mx-auto">
          <div className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/60 shadow-sm">
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                placeholder={t('chat.inputPlaceholder')}
                value={inputValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                className="w-full h-12 px-4 pr-12 rounded-xl border-0 bg-transparent text-sm focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={isLoading}
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md p-0 flex items-center justify-center bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
                disabled={isLoading || !inputValue.trim()}
                size="icon"
                variant="ghost"
              >
                {isLoading ? (
                  <Spinner size="small" />
                ) : (
                  <ArrowUp className="h-4 w-4 text-primary" />
                )}
              </Button>
            </form>
          </div>
          <div className="mt-2 text-xs text-center text-muted-foreground opacity-70">
            {t('chat.disclaimer')}
          </div>
        </div>
      </div>
    </div>
  );
}
