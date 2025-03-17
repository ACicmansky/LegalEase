'use client';

import { Chat } from '@/types/chat';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { X } from "lucide-react";
import { useTranslations } from 'next-intl';

interface ChatListProps {
  chats: Chat[];
  onChatSelect: (chatId: string) => void;
  selectedChatId?: string;
  onDeleteChat: (chatId: string) => void;
}

export function ChatList({ chats, onChatSelect, selectedChatId, onDeleteChat }: ChatListProps) {
  const t = useTranslations();
  return (
    <div className="p-1 sm:p-2 space-y-1 sm:space-y-2">
      {chats.map((chat) => (
        <Card
          key={chat.id}
          className={`group relative transition-colors hover:bg-accent/50 ${selectedChatId === chat.id
              ? 'bg-accent/80 shadow-sm'
              : 'bg-background'
            }`}
        >
          <Button
            variant="ghost"
            className="w-full justify-start p-2 sm:p-3 text-left"
            onClick={() => onChatSelect(chat.id)}
          >
            <div className="w-full pr-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <h3 className="font-medium truncate text-sm">
                  {chat.title}
                </h3>
              </div>
              <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground truncate max-w-full">
                {new Date(chat.created_at).toLocaleDateString()} · {new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 sm:right-2 top-1 sm:top-2 h-7 w-7 sm:h-6 sm:w-6 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive md:touch-none touch-auto"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteChat(chat.id);
            }}
            aria-label={t('chat.delete')}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </Card>
      ))}
      {chats.length === 0 && (
        <div className="text-center py-6 sm:py-8 text-sm text-muted-foreground">
          {t('chat.noChats')}
        </div>
      )}
    </div>
  );
}
