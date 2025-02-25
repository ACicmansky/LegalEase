'use client';

import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { ChatInterface } from "@/components/chat/ChatInterface";
import { ChatListContainer, ChatListContainerRef } from "@/components/chat/ChatListContainer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DocumentUpload } from "@/components/upload/DocumentUpload";
import { useAuth } from "@/context/AuthContext";
import { ChatService } from "@/lib/api/chatService";

export default function Home() {
  const { signIn, user } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<string>();
  const chatListRef = useRef<ChatListContainerRef>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !user) {
      const testEmail = process.env.NEXT_PUBLIC_TEST_EMAIL;
      const testPassword = process.env.NEXT_PUBLIC_TEST_PASSWORD;
      
      if (testEmail && testPassword) {
        signIn(testEmail, testPassword)
          .catch(error => console.error('Auto-login failed:', error));
      }
    }
  }, [signIn, user]);

  const handleSendMessage = async (message: string) => {
    if (!selectedChatId) return;

    try {
      await ChatService.addMessage(selectedChatId, message);
      // You might want to update the chat list or current chat here
      // depending on your real-time update strategy
    } catch (error) {
      console.error('Failed to send message:', error);
      toast('Failed to send message. Please try again.');
    }
  };

  const handleCreateNewChat = async () => {
    try {
      const newChat = await ChatService.createChat('New Chat ' + Date());
      chatListRef.current?.handleCreateChat(newChat);
      setSelectedChatId(newChat.id);
    } catch (error) {
      console.error('Failed to create new chat:', error);
      toast('Failed to create new chat. Please try again.');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <div className="w-64 border-r flex flex-col">
        {/* New Chat Button */}
        <div className="p-4">
          <Button
            onClick={handleCreateNewChat}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>
        
        {/* Document/Chat List */}
        <div className="flex-1">
          <ChatListContainer 
            ref={chatListRef}
            onChatSelect={setSelectedChatId}
            selectedChatId={selectedChatId}
          />
        </div>

        {/* User Settings */}
        <div className="p-4 border-t">
          {user && (
            <div className="flex items-center">
              <Avatar>
                <AvatarFallback>
                  {user.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="ml-2 text-sm text-muted-foreground">{user.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {selectedChatId ? (
          <ChatInterface 
            chatId={selectedChatId}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="scroll-m-20 text-4xl font-bold tracking-tight text-center mb-8">
                Chat with your Legal Documents
              </h1>
              <DocumentUpload />
            </div>
          </main>
        )}
      </div>
    </div>
  );
}