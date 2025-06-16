'use client';

import { useState, useRef, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    try {
      await onSendMessage(inputValue);
      setInputValue('');
      // Focus back on input after sending
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  
  return (
    <div className="bg-transparent py-2 md:py-4 px-2 md:px-4 lg:px-8 flex-shrink-0">
      <div className="max-w-2xl mx-auto">
        <div className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/60 shadow-sm">
          <form onSubmit={handleSubmit} className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder={t('chat.inputPlaceholder')}
              value={inputValue}
              maxLength={1800}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full h-10 md:h-12 px-3 md:px-4 pr-10 md:pr-12 rounded-xl border-0 bg-transparent text-sm focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isLoading}
            />
            <Button
              type="submit"
              className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md p-0 flex items-center justify-center bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
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
        <div className="mt-1 md:mt-2 text-[10px] md:text-xs text-center text-muted-foreground opacity-70">
          {t('chat.disclaimer')}
        </div>
      </div>
    </div>
  );
}
