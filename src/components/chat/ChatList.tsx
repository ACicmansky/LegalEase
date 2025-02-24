'use client';

import { Chat } from '@/types/chat';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface ChatListProps {
  chats: Chat[];
  onChatSelect: (chatId: string) => void;
  selectedChatId?: string;
  onDeleteChat: (chatId: string) => void;
}

export function ChatList({ chats, onChatSelect, selectedChatId, onDeleteChat }: ChatListProps) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-2">
        {chats.map((chat) => (
          <Card
            key={chat.id}
            className={`group relative transition-colors hover:bg-accent ${
              selectedChatId === chat.id
                ? 'bg-accent'
                : 'bg-background'
            }`}
          >
            <Button
              variant="ghost"
              className="w-full justify-start p-3 text-left"
              onClick={() => onChatSelect(chat.id)}
            >
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium truncate">
                    {chat.title}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {new Date(chat.timestamp).toLocaleDateString()}
                  </span>
                </div>
                {chat.documentName && (
                  <p className="text-sm text-muted-foreground mt-1">
                    📄 {chat.documentName}
                  </p>
                )}
                {chat.lastMessage && (
                  <p className="text-sm text-muted-foreground mt-1 truncate">
                    {chat.lastMessage}
                  </p>
                )}
              </div>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chat.id);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </Card>
        ))}
        {chats.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No chats yet
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
