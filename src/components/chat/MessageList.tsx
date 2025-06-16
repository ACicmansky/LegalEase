'use client';

import { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ChatMessage } from '@/types/chat';
import { Message } from './Message';
import { Spinner } from '@/components/ui/spinner';

interface MessageListProps {
  messages: ChatMessage[];
  isDocumentAnalyzing?: boolean;
}

export function MessageList({ messages, isDocumentAnalyzing = false }: MessageListProps) {
  const t = useTranslations();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar pt-12 md:pt-6">
      <div className="px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">
          {isDocumentAnalyzing && (
            <div className="flex justify-center my-4">
              <Spinner size="medium">
                <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {t('chat.analyzingDocument')}
                </span>
              </Spinner>
            </div>
          )}
          
          {messages.map((message) => (
            <Message
              key={message.id || `message-${message.created_at}`}
              {...message}
            />
          ))}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
