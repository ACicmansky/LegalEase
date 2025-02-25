'use client';

import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from "@/components/ui/button";
import { ChatService } from '@/lib/api/chatService';
import { Chat, ChatFolder } from '@/types/chat';
import { ChatList } from './ChatList';

interface ChatListContainerProps {
  onChatSelect: (chatId: string) => void;
  selectedChatId?: string;
  ref?: React.RefObject<ChatListContainerRef | null>;
}

export interface ChatListContainerRef {
  handleCreateChat: (newChat: Chat) => Promise<void>;
}

export function ChatListContainer({ onChatSelect, selectedChatId, ref }: ChatListContainerProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [folders, setFolders] = useState<ChatFolder[]>([]);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (ref) {
      ref.current = {
        handleCreateChat
      };
    }
  }, [ref, chats]);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const fetchedChats = await ChatService.getAllChats();
      setChats(fetchedChats);
    } catch (error) {
      console.error('Failed to load chats:', error);
      toast('Failed to load chats. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await ChatService.deleteChat(chatId);
      setChats(chats.filter(chat => chat.id !== chatId));
      toast('Chat deleted successfully');
    } catch (error) {
      console.error('Failed to delete chat:', error);
      toast('Failed to delete chat. Please try again.');
    }
  };

  const handleCreateChat = async (newChat: Chat) => {
    try {
      setChats([newChat, ...chats]);
      onChatSelect(newChat.id);
      toast('New chat created successfully');
    } catch (error) {
      console.error('Failed to create chat:', error);
      toast('Failed to create chat. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Folder Section */}
      <div className="px-3 py-2">
        {folders.map((folder) => (
          <Button
            key={folder.id}
            variant="ghost"
            className="w-full justify-start text-sm font-normal mb-1"
            onClick={() => {
              setFolders(
                folders.map((f) =>
                  f.id === folder.id
                    ? { ...f, isExpanded: !f.isExpanded }
                    : f
                )
              );
            }}
          >
            {folder.isExpanded ? (
              <ChevronDown className="h-4 w-4 mr-1" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-1" />
            )}
            {folder.name}
          </Button>
        ))}
      </div>

      {/* Chat List Section */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <ChatList
            chats={chats}
            onChatSelect={onChatSelect}
            selectedChatId={selectedChatId}
            onDeleteChat={handleDeleteChat}
          />
        )}
      </div>
    </div>
  );
}
