"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { ChatService } from "@/lib/api/chatService";
import { Chat, ChatFolder } from "@/types/chat";
import { ChatList } from "./ChatList";
import { useAuth } from "@/context/AuthContext";

interface ChatListContainerProps {
  onChatSelect: (chatId: string) => void;
  selectedChatId?: string;
  ref?: React.RefObject<ChatListContainerRef | null>;
}

export interface ChatListContainerRef {
  handleCreateChat: (newChat: Chat) => Promise<void>;
  getSelectedChatTitle: () => string | null;
}

export function ChatListContainer({
  onChatSelect,
  selectedChatId,
  ref,
}: ChatListContainerProps) {
  const t = useTranslations();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [folders, setFolders] = useState<ChatFolder[]>([]);
  const { user } = useAuth();

  const loadChats = useCallback(async () => {
    if (!user) {
      return;
    }
    try {
      setIsLoading(true);
      const fetchedChats = await ChatService.getAllChats();
      setChats(fetchedChats);
    } catch (error) {
      console.error("Failed to load chats:", error);
      toast(t("chat.failedToLoad"));
    } finally {
      setIsLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [loadChats, user]);

  // Define handleCreateChat with useCallback to avoid dependency issues
  const handleCreateChat = useCallback(async (newChat: Chat) => {
    setChats((prevChats) => [newChat, ...prevChats]);
    onChatSelect(newChat.id);
    toast(t("upload.successToast"));
  }, [onChatSelect, t]);

  // Get the title of the selected chat
  const getSelectedChatTitle = useCallback(() => {
    if (!selectedChatId) return null;
    const selectedChat = chats.find(chat => chat.id === selectedChatId);
    return selectedChat?.title || null;
  }, [selectedChatId, chats]);

  useEffect(() => {
    if (ref) {
      ref.current = {
        handleCreateChat,
        getSelectedChatTitle,
      };
    }
  }, [ref, handleCreateChat, getSelectedChatTitle]);

  const handleDeleteChat = async (chatId: string) => {
    try {
      await ChatService.deleteChat(chatId);
      setChats(chats.filter((chat) => chat.id !== chatId));
      toast(t("chat.deletedSuccessfully"));
    } catch (error) {
      console.error("Failed to delete chat:", error);
      toast(t("chat.failedToDelete"));
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
                  f.id === folder.id ? { ...f, isExpanded: !f.isExpanded } : f
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
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="h-full overflow-auto custom-scrollbar">
            <ChatList
              chats={chats}
              onChatSelect={onChatSelect}
              selectedChatId={selectedChatId}
              onDeleteChat={handleDeleteChat}
            />
          </div>
        )}
      </div>
    </div>
  );
}
